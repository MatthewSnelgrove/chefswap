import { pool } from "../configServices/dbConfig.js";
import camelize from "camelize";
import { bucket } from "../configServices/cloudStorageConfig.js";
import snakeize from "snakeize";
import { BusinessError, accountNotFound } from "../utils/errors.js";
import stripNulls from "../utils/stripNulls.js";
import parseInputMessage from "../socketParsers/inputMessageParser.js";
import socketInternalError from "../socketParsers/socketInternalError.js";
export default (io, socket) => {
  const sendMessage = (inputMessage, callback) => {
    var parsedMessage;
    try {
      parsedMessage = parseInputMessage(inputMessage);
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log(error);
        callback(error);
      } else {
        callback(socketInternalError(event));
      }

      return;
    }
    if (parsedMessage.errors) {
      //invalid inputMessage
      callback(parsedMessage);
      return;
    }
    //valid input message
    parsedMessage.messageUid = "test32e6-c4f8-44d4-9408-cfb4f8499d01";
    parsedMessage.senderUid = socket.accountUid;
    parsedMessage.timestamp = Date.now();
    io.to(parsedMessage.receiverUid).emit("receiveMessage", parsedMessage);
    callback(parsedMessage);
  };

  const deleteMessage = (messageId) => {
    //delete message in db?
    socket.emit("deleteMessage", messageId);
  };

  socket.on("sendMessage", sendMessage);
  socket.on("deleteMessage", deleteMessage);
};
