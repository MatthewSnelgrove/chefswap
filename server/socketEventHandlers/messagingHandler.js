import { pool } from "../configServices/dbConfig.js";
import camelize from "camelize";
import { generateImageLink } from "../utils/imageHelpers.js";
import {
  conversationNotFound,
  messageNotFound,
  sameUidMessages,
} from "../utils/errors.js";

export function getUid(socket) {
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
  async function getMessages(payload, callback) {
    const loggedUid = getUid(socket);
    const { interlocutorUid, curMessageId, limit } = payload;

    const { rows: conversation } = camelize(
      await pool.query(
        ` SELECT conversation.*
          FROM conversation
          WHERE (lo_account_uid = $1 AND hi_account_uid = $2) OR (lo_account_uid = $2 AND hi_account_uid = $1)`,
        [loggedUid, interlocutorUid]
      )
    );

    if (!conversation.length) {
      callback(conversationNotFound);
      return;
    }

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
            message.parent_message_uid,
            parent_message.sender_uid AS parent_message_sender_uid,
            parent_message."content" AS parent_message_content,
            parent_message.create_timestamp AS parent_message_create_timestamp,
            parent_message.edit_timestamp AS parent_message_edit_timestamp,
            parent_message.parent_message_uid AS parent_message_parent_message_uid
        FROM
            message
        JOIN conversation USING (conversation_uid)
        LEFT JOIN message AS parent_message ON (
          message.parent_message_uid = parent_message.message_uid
        )
        WHERE message.create_timestamp < (
           SELECT create_timestamp FROM message WHERE COALESCE (message_uid = $3, true) ORDER BY create_timestamp DESC LIMIT 1
        )
        ORDER BY message.create_timestamp ASC
        LIMIT $4`,
        [loggedUid, interlocutorUid, curMessageId, limit]
      )
    );
    const formattedMessages = rows.map((row) => {
      const message = {
        messageUid: row.messageUid,
        interlocutorUid: interlocutorUid,
        senderUid: row.senderUid,
        content: row.content,
        createTimestamp: row.createTimestamp,
        editTimestamp: row.editTimestamp,
      };
      const parentMessage = row.parentMessageUid
        ? {
            messageUid: row.parentMessageUid,
            interlocutorUid: interlocutorUid,
            senderUid: row.parentMessageSenderUid,
            content: row.parentMessageContent,
            createTimestamp: row.parentMessageCreateTimestamp,
            editTimestamp: row.parentMessageEditTimestamp,
            parentMessageUid: row.parentMessageParentMessageUid,
          }
        : null;
      return {
        message: message,
        parentMessage: parentMessage,
      };
    });
    callback({ messages: formattedMessages });
  }

  async function readMessage(payload, callback) {
    const loggedUid = getUid(socket);

    const rows = camelize(
      await pool.query(
        `SELECT conversation.*, 
                message.*
        FROM message  
        JOIN conversation USING (conversation_uid)
        WHERE message.message_uid = $1 
          AND (conversation.lo_account_uid = $2
                OR conversation.hi_account_uid = $2)`,
        [payload.messageUid, loggedUid]
      )
    ).rows;

    if (rows.length === 0) {
      callback(messageNotFound);
      return;
    }
    const messageConv = rows[0];

    const message = {
      messageUid: messageConv.messageUid,
      interlocutorUid: messageConv.senderUid,
      senderUid: messageConv.senderUid,
      content: messageConv.content,
      createTimestamp: messageConv.createTimestamp,
      editTimestamp: messageConv.editTimestamp,
      parentMessageUid: messageConv.parentMessageUid,
    };

    const updateConvSeen = camelize(
      await pool.query(
        `UPDATE conversation SET ${
          loggedUid === messageConv.hiAccountUid ? "hi_seen" : "lo_seen"
        } = $1 WHERE conversation_uid = $2`,
        [payload.messageUid, messageConv.conversationUid]
      )
    );

    io.to(messageConv.conversationUid).emit("receiveReadMessage", message);

    callback(updateConvSeen);
  }

  async function sendMessage(payload, callback) {
    const message = payload;
    const loggedUid = getUid(socket);

    const [maxUid, minUid] = getMinMax(message.interlocutorUid, loggedUid);

    const findConversation = camelize(
      await pool.query(
        `SELECT conversation_uid, lo_active, hi_active FROM conversation WHERE hi_account_uid = $1 AND lo_account_uid = $2`,
        [maxUid, minUid]
      )
    ).rows;

    if (findConversation.length === 0) {
      callback(conversationNotFound);
      return;
    }

    if (!findConversation[0].loActive || !findConversation[0].hiActive) {
      await pool.query(
        `UPDATE conversation SET lo_active = true, hi_active = true WHERE conversation_uid = $1`,
        [findConversation[0].conversationUid]
      );

      // this is shit
      await getConversations((conversations) => {
        const newConversation = conversations.find(
          (conversation) =>
            conversation.interlocutor.accountUid === message.interlocutorUid
        );
        io.to(message.interlocutorUid).emit(
          "receiveConversationActivation",
          newConversation
        );
      });
    }
    const parentMessage = message.parentMessageUid
      ? camelize(
          await pool.query(
            ` SELECT 
                message.sender_uid AS parent_message_sender_uid,
                message."content" AS parent_message_content,
                message.create_timestamp AS parent_message_create_timestamp,
                message.edit_timestamp AS parent_message_edit_timestamp,
                message.parent_message_uid AS parent_message_parent_message_uid
              FROM message 
              WHERE message_uid = $1`,
            [message.parentMessageUid]
          )
        ).rows
      : null;

    if (message.parentMessageUid) {
      if (parentMessage.length === 0) {
        callback(messageNotFound);
        return;
      }
      parentMessage[0].interlocutorUid = message.interlocutorUid;
    }

    const insertMessage = camelize(
      await pool.query(
        `INSERT INTO message (sender_uid, conversation_uid, content, parent_message_uid) 
          VALUES ($1, $2, $3, $4)`,
        [
          loggedUid,
          findConversation[0].conversationUid,
          message.content,
          message.parentMessageUid,
        ]
      )
    );

    const bothSeen = camelize(
      await pool.query(
        `UPDATE conversation SET lo_active = true, hi_active = true WHERE conversation_uid = $1`,
        [findConversation[0].conversationUid]
      )
    );

    const messageBack = {
      message: {
        messageUid: insertMessage.messageUid,
        interlocutorUid: message.interlocutorUid,
        senderUid: loggedUid,
        content: message.content,
        createTimestamp: insertMessage.createTimestamp,
        editTimestamp: insertMessage.editTimestamp,
      },
      parentMessage: parentMessage ? parentMessage[0] : null,
    };

    io.to(findConversation[0].conversationUid).emit(
      "receiveMessage",
      messageBack
    );
    callback(insertMessage);
  }

  async function editMessage(payload, callback) {
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

    const updatedMessage = camelize(
      await pool.query(
        `UPDATE message SET content = $1 WHERE message_uid = $2
         RETURNING message_uid, sender_uid, content, create_timestamp, edit_timestamp, parent_message_uid`,
        [payload.content, payload.messageUid]
      )
    ).rows;

    io.to(findConversation[0].conversationUid).emit(
      "receiveMessageEdit",
      updatedMessage
    );

    callback(updatedMessage);
  }

  async function deleteMessage(payload, callback) {
    const loggedUid = getUid(socket);
    const messageUid = payload.messageUid;

    const message = camelize(
      await pool.query(
        `SELECT message_uid, conversation_uid, create_timestamp FROM message WHERE message_uid = $1 AND sender_uid = $2`,
        [messageUid, loggedUid]
      )
    ).rows;

    if (!message.length) {
      //not the actually user who sent it or not found
      callback(messageNotFound);
      return;
    }

    // if message has replies, replace their reply_message_id with their own message_id
    await pool.query(
      `UPDATE message SET parent_message_uid = message_uid WHERE parent_message_uid = $1`,
      [messageUid]
    );

    // if message is a seen message, replace the conversation's seen message with the previous message sent by the sender
    const interlocutorUid = await pool.query(
      `UPDATE conversation SET 
        lo_seen = (
          CASE
            WHEN lo_seen = $1 THEN (
              SELECT message_uid
              FROM message
              WHERE sender_uid = $2 AND
                conversation_uid = $3 AND
                create_timestamp < (SELECT create_timestamp FROM message WHERE message_uid = $1)
              ORDER BY create_timestamp DESC LIMIT 1
            )
            ELSE lo_seen
          END
        ), 
        hi_seen = (
          CASE
            WHEN hi_seen = $1 THEN (
              SELECT message_uid
              FROM message
              WHERE sender_uid = $2 AND
                conversation_uid = $3 AND
                create_timestamp < (SELECT create_timestamp FROM message WHERE message_uid = $1)
              ORDER BY create_timestamp DESC LIMIT 1
            )
            ELSE hi_seen
          END
        )
        WHERE conversation_uid = $3
        RETURNING CASE
          WHEN lo_account_uid = $2 THEN hi_account_uid
          WHEN hi_account_uid = $2 THEN lo_account_uid
          END
        AS interlocutor_uid`,
      [messageUid, loggedUid, message[0].conversationUid]
    ).rows[0].interlocutorUid;

    camelize(
      await pool.query(
        `DELETE FROM message WHERE message_uid = $1 RETURNING message_uid`,
        [messageUid]
      )
    );

    io.to(message[0].conversationUid).emit("receiveMessageDelete", {
      messageUid: messageUid,
      interlocutorUid: interlocutorUid,
    });

    callback({});
  }

  async function getConversations(callback) {
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

    const formattedRes = rows.map((row) => {
      const interlocutor = {
        accountUid: row.interlocutorUid,
        username: row.interlocutorUsername,
        pfpLink: generateImageLink(row.interlocutorPfpName),
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
    callback(formattedRes);
  }

  //I dont think I need any error checking stuff here
  //Also think its fine to trust messagerId because its only changing based off of getUid func
  async function leaveConversation(payload, callback) {
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

  async function joinConversation(payload, callback) {
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
    userData.pfpLink = generateImageLink(userData.pfpName);
    delete userData.pfpName;
    callback(userData);
  }

  socket.on("getMessages", getMessages);
  socket.on("sendMessage", sendMessage);
  socket.on("editMessage", editMessage);
  socket.on("deleteMessage", deleteMessage);
  socket.on("readMessage", readMessage);
  socket.on("getConversations", getConversations);
  socket.on("leaveConversation", leaveConversation);
  socket.on("joinConversation", joinConversation);
};
