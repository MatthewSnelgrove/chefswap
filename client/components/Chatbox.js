import React, { useState, useEffect } from "react";
import ChatContent from "./ChatContent";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import styles from "./styles/Chatbox.module.scss";

/**
 * Container component for entire chatting section of /my-messages
 * @use ChatHeader, ChatContent, ChatInput
 */
export default function Chatbox() {
  return (
    <div style={{ flex: 2 }} className={styles.chatbox}>
      <ChatHeader />
      <ChatContent />
      <ChatInput />
    </div>
  );
}
