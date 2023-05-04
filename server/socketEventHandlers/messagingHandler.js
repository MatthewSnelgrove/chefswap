import { pool } from "../configServices/dbConfig.js";
import camelize from "camelize";
import { bucket } from "../configServices/cloudStorageConfig.js";
import snakeize from "snakeize";
import { BusinessError, accountNotFound } from "../utils/errors.js";
import stripNulls from "../utils/stripNulls.js";
import parseInputMessage from "../socketParsers/inputMessageParser.js";
export default (io, socket) => {
  const sendMessage = (inputMessage, callback) => {
    const parsedMessage = parseInputMessage(inputMessage);
    if (!parsedMessage.errors) {
      //valid inputMessage
      parsedMessage.messageUid = "test32e6-c4f8-44d4-9408-cfb4f8499d01";
      parsedMessage.senderUid = socket.accountUid;
      parsedMessage.timestamp = Date.now();
      io.to(parsedMessage.receiverUid).emit("receiveMessage", parsedMessage);
    }
    callback(parsedMessage);
  };

  const deleteMessage = (messageId) => {
    //delete message in db?
    socket.emit("deleteMessage", messageId);
  };

  socket.on("sendMessage", sendMessage);
  socket.on("deleteMessage", deleteMessage);
};
