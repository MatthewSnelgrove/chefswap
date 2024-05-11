import { useEffect, useRef, useState } from "react";
import { useUser } from "../components/useUser.js";
import socket from "../utils/socket.js";

const useMessages = (interlocutorUidPassed, limit = 3) => {
  const user = useUser();
  const socketRef = useRef();
  const [conversations, setConversations] = useState(null);
  const [messages, setMessages] = useState(null);
  const [interlocutorUid, setInterlocutorUid] = useState(null);

  useEffect(() => {
    if (interlocutorUidPassed !== interlocutorUid) {
      setInterlocutorUid(interlocutorUidPassed);
    }
  });

  function useSocketOperation(socketFunction, ...args) {
    socketRef.current.emit(socketFunction, ...args);
  }

  // //// GARBAGE CODE ZONE //////

  // const [tempTrigger, setTemp] = useState(false);

  // useEffect(() => {
  //   console.log(conversations);
  // }, [conversations]);

  // useEffect(() => {
  //   console.log(messages);
  // }, [messages]);

  // useEffect(() => {
  //   if (!socketRef.current) {
  //     return;
  //   }
  //   socketRef.current.emit(
  //     "joinConversation",
  //     {
  //       interlocutorUid: "29eed86d-8196-4866-92e0-0cd5c50106dd",
  //     },
  //     (d) => {
  //       console.log(d);
  //     }
  //   );
  // }, [tempTrigger]);

  // useEffect(() => {
  //   if (!socketRef.current) {
  //     return;
  //   }
  //   socketRef.current.emit(
  //     "sendMessage",
  //     {
  //       interlocutorUid: "29eed86d-8196-4866-92e0-0cd5c50106dd",
  //       content: "X D X D X D X D 2",
  //       // parentMessageUid: "fae2faac-ce03-49ed-9d91-5786069cee5f",
  //     },
  //     (d) => {
  //       console.log(d);
  //     }
  //   );
  // }, [tempTrigger]);

  // ///////////

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = socket;
    }
    
    socketRef.current.emit("getConversations", setConversations);
  }, [])

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!socketRef.current) {
      socketRef.current = socket;
    }

    socketRef.current.on("receiveMessageEdit", (editedMessage) => {
      if (!(editedMessage.interlocutorUid === interlocutorUid)) {
        return;
      }

      const formattedEditMessage = {
        content: editedMessage.content,
        createTimestamp: editedMessage.createTimestamp,
        editedMessage: editedMessage.editTimestamp,
        interlocutorUid: editedMessage.interlocutorUid,
        messageUid: editedMessage.messageUid,
        senderUid: editedMessage.senderUid,
      };

      setMessages((oldMessages) => {
        const messageFindIndex = oldMessages.find(
          (curMessage) =>
            curMessage.message.messageUid === editedMessage.messageUid
        );

        oldMessages[messageFindIndex].message = formattedEditMessage;

        return oldMessages;
      });
    });

    socketRef.current.on("receiveMessageDelete", (deleteMessage) => {
      if (!(deleteMessage.interlocutorUid === interlocutorUid)) {
        return;
      }

      setMessages((oldMessages) => {
        return oldMessages.filter(
          (curMessage) =>
            curMessage.message.messageUid === deleteMessage.messageUid
        );
      });
    });

    socketRef.current.on("receiveMessage", (newMessage) => {
      if (!(newMessage.interlocutorUid === interlocutorUid)) {
        return;
      }

      setMessages((oldMessages) => {
        return [...oldMessages, newMessage];
      });
    });

    socketRef.current.on("receiveReadMessage", (updatedReadMessage) => {
      if (!(updatedReadMessage.interlocutorUid === interlocutorUid)) {
        return;
      }

      setConversations((curConversations) => {
        const interlocutorIndex = curConversations.find(
          (conversation) =>
            conversation.interlocutor.accountUid === interlocutorUid
        );
        curConversations[interlocutorIndex].lastSeenMessage =
          updatedReadMessage;
        return curConversations;
      });
    });

    // return () => {
    //   if (socketRef.current) {
    //     socketRef.current.removeAllListeners();
    //     socketRef.current.disconnect();
    //   }
    // };
  }, [user, interlocutorUid]);

  useEffect(() => {
    if (!interlocutorUid) {
      return;
    }

    // Set messages to null (loading)
    setMessages(null);

    socketRef.current.emit(
      "getMessages",
      {
        interlocutorUid: interlocutorUid,
        limit: limit,
      },
      (responseMessage) => {
        setMessages(responseMessage.messages);
        // setTemp(true);
      }
    );
  }, [interlocutorUid]);

  return { conversations, messages, useSocketOperation };
};
export default useMessages;
