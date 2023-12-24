import React, { Component } from "react";
import styles from "./styles/ChatInput.module.scss";

/**
 * User input chatbar for sending messages (bottom bar of chat)
 */
function ChatInput(props) {
  function handleSend(e) {
    e.preventDefault();
    const chatInput = document.querySelector("#chat-input");
    const msg = chatInput.value;
    socket.emit(
      "sendUserMessage",
      {
        reveiverUid: "fa4632e6-c4f8-44d4-9408-cfb4f8499d01",
        content: msg,
      },
      (response) => {
        props.setMessages((pastMessages) => [...pastMessages, response]);
      }
    );
    chatInput.value = "";
  }

  return (
    <div className={styles.chat_input_container}>
      <form onSubmit={handleSend} className={styles.chat_form}>
        <input
          id="chat-input"
          type="text"
          className={styles.chat_input}
          placeholder="Send a message"
          autoComplete="off"
        />
        <button type="submit" className={styles.send_btn}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatInput;
