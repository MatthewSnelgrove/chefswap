import React, { useState, useEffect } from "react";
import ChatContent from "./ChatContent";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import "./styles/Chatbox.scss";
import useSocketSetup from "../utils/useSocketSetup";
import socket from "../utils/socket";

/**
 * Container component for entire chatting section of /my-messages
 * @use ChatHeader, ChatContent, ChatInput
 */
function Chatbox(props) {
  const [messages, setMessages] = useState([])
  useSocketSetup()
  
  
  useEffect(() => {
    socket.on("receiveUserMessage", (message) => {
      console.log(message)
      // setMessages((pastMessages) => [...pastMessages, message])
      setMessages((pastMessages) => [...pastMessages, message])
    });
    return () => {
      socket.off("receiveUserMessage");
    }
  }, [])

  
  
  return (
    <div style={{ flex: 2 }} className="chatbox">
      <ChatHeader />
      <ChatContent messages={messages} />
      <ChatInput setMessages={setMessages} />
    </div>
  );
}

export default Chatbox;

