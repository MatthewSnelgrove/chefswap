import { useEffect } from "react";
import socket from "./socket";

const useSocketSetup = () => {
  useEffect(() => {
    console.log("connected to socket");
    socket.connect();
    socket.on("connect_error", () => {
      console.log(`connect_error"`);
    });
    socket.on("receiveUserMessage", (message) => {
      console.log("received message1", Date.now());
      console.log(message);
    });
    return () => {
      console.log("disconnected from socket");
      socket.off("connect_error");
      socket.off("receiveUserMessage");
      socket.disconnect();
    };
  }, []);
};
export default useSocketSetup;
