import { pool } from "../configServices/dbConfig.js";
import camelize from "camelize";

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
        `SELECT * FROM conversation WHERE lo_account_uid = $1 OR hi_account_uid = $1`,
        [loggedUid]
      )
    );

    callback(rows);
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

  async function JoinConversation(payload, callback) {}

  socket.on("GetMessages", GetMessages);
  socket.on("SendMessage", SendMessage);
  socket.on("EditMessage", EditMessage);
  socket.on("DeleteMessage", DeleteMessage);
  socket.on("ReadMessages", ReadMessages);
  socket.on("GetConversations", GetConversations);
  socket.on("LeaveConversation", LeaveConversation);
  socket.on("JoinConversation", JoinConversation);
};
