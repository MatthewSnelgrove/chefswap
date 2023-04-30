export default (io, socket) => {
  const sendMessage = (message) => {
    //save message in db?
    socket.emit("sendMessage", "hello from server");
    console.log(message);
  };

  const deleteMessage = (messageId) => {
    //delete message in db?
    socket.emit("deleteMessage", messageId);
  };

  socket.on("sendMessage", sendMessage);
  socket.on("deleteMessage", deleteMessage);
};
