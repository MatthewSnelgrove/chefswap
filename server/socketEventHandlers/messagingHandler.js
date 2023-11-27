import { pool } from "../configServices/dbConfig.js";
import camelize from "camelize";
import { sameUidMessages } from "../utils/errors.js";

function getUid(socket) {
  return socket.request.session.accountUid;
}

function getMinMax(uid1, uid2) {
  return [Math.max(uid1, uid2), Math.min(uid1, uid2)];
}

export default (io, socket) => {
  // need to add seen field to messages based on sent time of message vs sent time of last read message
  async function GetMessages(payload, callback) {}

  async function ReadMessages(payload, callback) {}

  async function SendMessage(payload, callback) {}

  async function EditMessage(payload, callback) {}

  async function DeleteMessage(payload, callback) {
    const loggedUid = getUid(socket);
    const messageUid = payload.messageUid;

    const { actuallySent } = camelize(
      await pool.query(
        `SELECT sender_uid FROM conversation WHERE message_uid = $1`,
        [messageUid]
      )
    );

    if (!(actuallySent === loggedUid)) {
      //not the actually user who sent it or not found
    }

    const { rows } = camelize(
      await pool.query(`DELETE * FROM message WHERE message_uid = $1`, [
        messageUid,
      ])
    );

    callback(rows);
  }

  async function GetConversations(payload, callback) {
    const loggedUid = getUid(socket);

    const { rows } = camelize(
      await pool.query(
        `WITH LatestMessages AS (
          SELECT
              message.conversation_uid,
              MAX(messages.create_timestamp) AS latest_timestamp
          FROM
              messages
          WHERE
              m.sender_id = :user_id -- Replace :user_id with the specific user's ID
          GROUP BY
              m.conversation_id
      )
      SELECT
          c.conversation_id,
          c.member1_id,
          c.member2_id,
          m.message_id,
          m.sender_id,
          m.message_text,
          m.timestamp
      FROM
          conversations c
      JOIN
          LatestMessages lm ON c.conversation_id = lm.conversation_id
      JOIN
          messages m ON lm.conversation_id = m.conversation_id AND lm.latest_timestamp = m.timestamp;`,
      )
    );

    console.log(rows);
    callback(rows)
    
    
    // const conversations = camelize(
    //   await pool.query(
    //     `SELECT * FROM conversation WHERE lo_account_uid = $1 OR hi_account_uid = $1
    //     JOIN message USING (conversation_uid)`,
    //     [loggedUid]
    //   )
    // ).rows;
    // const conversationUids = conversations.map((conversation) => conversation.conversationUid);
    // const lastMessages = camelize(
    //   await pool.query(
    //     `SELECT * FROM message WHERE conversation_uid = ANY $1`,
    //     [conversationUids]
    //   )
    // )
    // callback({conversations: conversations})
  }

  //I dont think I need any error checking stuff here
  //Also think its fine to trust messagerId because its only changing based off of getUid func
  async function LeaveConversation(payload, callback) {
    const loggedUid = getUid(socket);

    const highUid = getMinMax(payload.messagerId, loggedUid)[0];

    const isHigh = loggedUid === highUid ? "hi_active" : "lo_active";

    const { rows } = camelize(
      await pool.query(`UPDATE conversation SET $1 = false`, [isHigh])
    );

    callback(rows);
  }

  async function JoinConversation(payload, callback) {
    const loggedUid = getUid(socket)

    if (payload.messagerUid == loggedUid) {
      callback(sameUidMessages)
      return
    }

    const [ maxUid, minUid ] = getMinMax(loggedUid, payload.messagerUid)

    const conversations = camelize(
      await pool.query(
        `INSERT INTO conversation (lo_account_uid, hi_account_uid, lo_active, hi_active), 
          VALUES ($1, $2, $3, $4)`,
        [minUid, maxUid, minUid === loggedUid ? true : false, maxUid === loggedUid ? true : false]
      )
      .catch(async (e) => {
        console.log(e.constraint)
        switch(e.constraint) {
          case "Find": 
            const convFound = camelize(
              await pool.query(
                'UPDATE conversation SET $1 = true WHERE lo_account_uid = $2 AND hi_account_uid = $3',
                [minUid === loggedUid ? "lo_account_uid": "hi_account_uid", minUid, maxUid]
              )
            );
        }
      })
    );

    const userData = camelize(
      await pool.query(
        'SELECT account_uid, username, pfp_name FROM conversation WHERE account_uid = $1',
        [payload.messagerId]
      )
    ).rows;
    callback(userData)
    //code
  }
  

  socket.on("GetMessages", GetMessages);
  socket.on("SendMessage", SendMessage);
  socket.on("EditMessage", EditMessage);
  socket.on("DeleteMessage", DeleteMessage);
  socket.on("ReadMessages", ReadMessages);
  socket.on("GetConversations", GetConversations);
  socket.on("LeaveConversation", LeaveConversation);
  socket.on("JoinConversation", JoinConversation);
};
