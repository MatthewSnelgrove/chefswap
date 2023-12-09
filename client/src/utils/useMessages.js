import { useEffect, useRef, useState } from "react";
import { useUser } from "../components/useUser.js";
import socket from "../utils/socket.js";

const useMessages = (interlocutorUid, curMessageId = null, limit = 3) => {
  const user = useUser();
  const socketRef = useRef();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  function useSocketOperation(socketFunction, ...args) {
    socketRef.current.emit(socketFunction, ...args);
  }

  useEffect(() => {
    if (!socketRef.current) {
      return;
    }

    socketRef.current.emit(
      "sendMessage",
      {
        interlocutorUid: interlocutorUid,
        content: "X D X D X D X D",
        parentMessageUid: "fae2faac-ce03-49ed-9d91-5786069cee5f",
      },
      (d) => {}
    );
  }, [messages]);

  useEffect(() => {
    if (!user) {
      return;
    }

    socketRef.current = socket;
    socketRef.current.emit("getConversations", setConversations);
    socketRef.current.emit(
      "getMessages",
      {
        interlocutorUid: interlocutorUid,
        limit: limit,
      },
      (messages) => {
        setMessages(messages.messages);
      }
    );

    socketRef.current.on("receiveMessage", (message) => {
      console.log(message);
    });
  }, [user]);

  return { conversations, messages, useSocketOperation };
};
export default useMessages;
