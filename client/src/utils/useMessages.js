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
        curMessageId: curMessageId,
      },
      setMessages
    );
  }, [user]);

  return { conversations, messages, useSocketOperation };
};
export default useMessages;
