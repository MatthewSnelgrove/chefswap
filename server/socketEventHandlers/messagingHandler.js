export default (io, socket) => {
  const sendUserMessage = (message, callback) => {
    //validate message
    //receiver exists
    //save message in db
    console.log("input message: ", message);
    message.messageUid = "test32e6-c4f8-44d4-9408-cfb4f8499d01";
    message.senderUid = socket.accountUid;
    message.receiverUid = "fa4632e6-c4f8-44d4-9408-cfb4f8499d01";
    message.timestamp = Date.now();
    console.log("output message: ", message);
    io.to(message.receiverUid).emit("receiveUserMessage", message);
    callback(message);
  };

  const deleteMessage = (messageId) => {
    //delete message in db?
    socket.emit("deleteMessage", messageId);
  };

  socket.on("sendUserMessage", sendUserMessage);
  socket.on("deleteMessage", deleteMessage);
};
