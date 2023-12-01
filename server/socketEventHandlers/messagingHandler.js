import { pool } from "../configServices/dbConfig.js";
import camelize from "camelize";
import {
  conversationNotFound,
  messageNotFound,
  sameUidMessages,
} from "../utils/errors.js";

function getUid(socket) {
  return socket.request.session.accountUid;
}

function getMinMax(uid1, uid2) {
  if (uid1 > uid2) {
    return [uid1, uid2];
  } else {
    return [uid2, uid1];
  }
}

export default (io, socket) => {
  // need to add seen field to messages based on sent time of message vs sent time of last read message
  async function GetMessages(payload, callback) {
    const loggedUid = getUid(socket);
    const { interlocutorUid, curMessageId, limit } = payload;

    const { rows } = camelize(
      await pool.query(
        `WITH 
        conversation AS (
          SELECT 
            conversation.conversation_uid
            FROM conversation
            WHERE (
              conversation.lo_account_uid = $1 AND conversation.hi_account_uid = $2
            ) 
            OR (
              conversation.lo_account_uid = $2 AND conversation.hi_account_uid = $1
            )
          )
        SELECT
            message.message_uid,
            message.sender_uid,
            message."content",
            message.create_timestamp,
            message.edit_timestamp,
            message.parent_message_uid
        FROM
            message
        JOIN conversation USING (conversation_uid)
        WHERE message.create_timestamp < (
           SELECT create_timestamp FROM message WHERE COALESCE (message_uid = $3, true) ORDER BY create_timestamp DESC LIMIT 1
        )
        ORDER BY message.create_timestamp DESC
        LIMIT $4`,
        [loggedUid, interlocutorUid, curMessageId, limit]
      )
    );
    callback({ messages: rows });
  }

  async function ReadMessages(payload, callback) {
    const loggedUid = getUid(socket);

    const findConversation = camelize(
      await pool.query(
        `SELECT conversation.* FROM message  
        JOIN conversation USING (conversation_uid)
        WHERE message.message_uid = $1 AND (lo_account_uid = $2 OR hi_account_uid = $2)`,
        [payload.messageUid, loggedUid]
      )
    ).rows;

    if (findConversation.length === 0) {
      callback(conversationNotFound);
      return;
    }

    const updateConvSeen = camelize(
      //need to check logged in user is acutally part of conversation
      await pool.query(
        "UPDATE conversation SET $1 = $2 WHERE conversation_uid = $3",
        [
          loggedUid === findConversation.hi_account_uid
            ? "hi_account_uid"
            : "lo_account_uid",
          payload.messageUid,
          findConversation.conversation_uid,
        ]
      )
    );

    callback(updateConvSeen);
  }

  async function SendMessage(payload, callback) {
    const message = payload.message;
    const loggedUid = getUid(socket);

    const [maxUid, minUid] = getMinMax(message.interlocutorUid, loggedUid);

    const findConversation = camelize(
      await pool.query(
        `SELECT conversation_uid FROM conversation WHERE hi_account_uid = $1 AND lo_account_uid = $2`,
        [maxUid, minUid]
      )
    ).rows;

    if (findConversation.length === 0) {
      callback(conversationNotFound);
      return;
    }

    const insertMessage = camelize(
      await pool.query(
        `INSERT INTO message (sender_uid, conversation_uid, content, parent_message_uid) 
          VALUES ($1, $2, $3, $4)`,
        [
          message.senderUid,
          findConversation[0].conversationUid,
          message.content,
          message.parentMessageUid,
        ]
      )
    );

    callback(insertMessage);
  }

  async function EditMessage(payload, callback) {
    const loggedUid = getUid(socket);

    const findConversation = camelize(
      await pool.query(
        `SELECT conversation.* FROM message  
        JOIN conversation USING (conversation_uid)
        WHERE message.message_uid = $1 AND (lo_account_uid = $2 OR hi_account_uid = $2)`,
        [payload.messageUid, loggedUid]
      )
    ).rows;

    if (findConversation.length === 0) {
      callback(conversationNotFound);
      return;
    }

    const updateConversation = camelize(
      await pool.query(
        `UPDATE message SET content = $1 WHERE message_uid = $2`,
        [payload.content, payload.messageUid]
      )
    ).rows;

    callback(updateConversation);
  }

  async function DeleteMessage(payload, callback) {
    const loggedUid = getUid(socket);
    const messageUid = payload.messageUid;

    const { actuallySent } = camelize(
      await pool.query(
        `SELECT sender_uid FROM conversation WHERE message_uid = $1`,
        [messageUid]
      )
    );

    if (!(actuallySent.sender_uid === loggedUid)) {
      //not the actually user who sent it or not found
      callback(messageNotFound);
      return;
    }

    const { rows } = camelize(
      await pool.query(`DELETE * FROM message WHERE message_uid = $1`, [
        messageUid,
      ])
    );

    callback(rows);
  }

  async function GetConversations(callback) {
    const loggedUid = getUid(socket);

    const { rows } = camelize(
      await pool.query(
        `WITH 
        interlocutor AS (
          SELECT 
            conversation.conversation_uid,
            account.account_uid,
            account.username,
            account.pfp_name
            FROM conversation
            JOIN account
            ON (
            account.account_uid = 
            CASE
              WHEN conversation.lo_account_uid = $1 THEN conversation.hi_account_uid
              WHEN conversation.hi_account_uid = $1 THEN conversation.lo_account_uid
            END
          )
        ),
        latest_message AS (
          SELECT conversation_uid, MAX(create_timestamp) AS latest_message_timestamp
          FROM message
          GROUP BY conversation_uid 
        ),
        last_seen_message AS (
          SELECT 
            message.*
          FROM conversation
          JOIN message
           ON (
             message.message_uid =
             CASE
               WHEN conversation.lo_account_uid = $1 THEN conversation.hi_seen
               WHEN conversation.hi_account_uid = $1 THEN conversation.lo_seen
             END
           )
        )
        SELECT
          interlocutor.account_uid AS interlocutor_uid,
            interlocutor.username AS interlocutor_username,
            interlocutor.pfp_name AS interlocutor_pfp_name,
            message.message_uid AS latest_message_uid,
            message.sender_uid AS latest_message_sender_uid,
            message."content" AS latest_message_content,
            message.create_timestamp AS latest_message_create_timestamp,
            message.edit_timestamp  AS latest_message_edit_timestamp,
            message.parent_message_uid AS latest_message_parent_message_uid,
            last_seen_message.message_uid AS last_seen_message_uid,
            last_seen_message.sender_uid AS last_seen_message_sender_uid,
            last_seen_message."content" AS last_seen_message_content,
            last_seen_message.create_timestamp AS last_seen_message_create_timestamp,
            last_seen_message.edit_timestamp  AS last_seen_message_edit_timestamp,
            last_seen_message.parent_message_uid AS last_seen_message_parent_message_uid
        FROM
            conversation
        JOIN interlocutor ON (
          conversation.conversation_uid = interlocutor.conversation_uid
        )
        LEFT JOIN latest_message ON (
          conversation.conversation_uid = latest_message.conversation_uid 
        )
        LEFT JOIN message ON (
          conversation.conversation_uid = message.conversation_uid AND
          latest_message.latest_message_timestamp = message.create_timestamp 
        )
        LEFT JOIN last_seen_message ON (
          conversation.conversation_uid = last_seen_message.conversation_uid
        )`,
        [loggedUid]
      )
    );

    console.log(rows);
    const formattedRes = rows.map((row) => {
      const interlocutor = {
        accountUid: row.interlocutorUid,
        username: row.interlocutorUsername,
        pfpName: row.interlocutorPfpName,
      };
      const lastMessage = row.latestMessageUid
        ? {
            messageUid: row.latestMessageUid,
            interlocutorUid: row.interlocutorUid,
            senderUid: row.latestMessageSenderUid,
            content: row.latestMessageContent,
            createTimestamp: row.latestMessageCreateTimestamp,
            editTimestamp: row.latestMessageEditTimestamp,
            parentMessageUid: row.latestMessageParentMessageUid,
          }
        : null;
      const lastSeenMessage = row.lastSeenMessageUid
        ? {
            messageUid: row.lastSeenMessageUid,
            interlocutorUid: row.interlocutorUid,
            senderUid: row.lastSeenMessageSenderUid,
            content: row.lastSeenMessageContent,
            createTimestamp: row.lastSeenMessageCreateTimestamp,
            editTimestamp: row.lastSeenMessageEditTimestamp,
            parentMessageUid: row.lastSeenMessageParentMessageUid,
          }
        : null;
      return {
        interlocutor: interlocutor,
        lastMessage: lastMessage,
        lastSeenMessage: lastSeenMessage,
      };
    });
    console.log(formattedRes);
    callback(formattedRes);
  }

  //I dont think I need any error checking stuff here
  //Also think its fine to trust messagerId because its only changing based off of getUid func
  async function LeaveConversation(payload, callback) {
    const loggedUid = getUid(socket);

    const [maxUid, minUid] = getMinMax(payload.interlocutorUid, loggedUid);

    const { rows } = camelize(
      await pool.query(
        `UPDATE conversation SET ${
          loggedUid === maxUid ? "hi_active" : "lo_active"
        } = false
                        WHERE lo_account_uid = $1 AND hi_account_uid = $2
                        RETURNING *`,
        [minUid, maxUid]
      )
    );

    if (rows.length === 0) {
      callback(conversationNotFound);
      return;
    }

    callback(rows);
  }

  async function JoinConversation(payload, callback) {
    const loggedUid = getUid(socket);

    if (payload.interlocutorUid == loggedUid) {
      callback(sameUidMessages);
      return;
    }

    const [maxUid, minUid] = getMinMax(loggedUid, payload.interlocutorUid);

    const conversations = camelize(
      await pool
        .query(
          `INSERT INTO conversation (lo_account_uid, hi_account_uid, lo_active, hi_active) 
          VALUES ($1, $2, $3, $4)`,
          [
            minUid,
            maxUid,
            minUid === loggedUid ? true : false,
            maxUid === loggedUid ? true : false,
          ]
        )
        .catch(async (e) => {
          switch (e.constraint) {
            case "conversation_un":
              const convFound = camelize(
                await pool.query(
                  `UPDATE conversation SET ${
                    minUid === loggedUid ? "lo_active" : "hi_active"
                  } = true WHERE lo_account_uid = $1 AND hi_account_uid = $2`,
                  [minUid, maxUid]
                )
              );
          }
        })
    );

    const userData = camelize(
      await pool.query(
        "SELECT account_uid, username, pfp_name FROM account WHERE account_uid = $1",
        [payload.interlocutorUid]
      )
    ).rows;
    callback(userData);
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
