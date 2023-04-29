import React, { Component } from "react";
import styles from "./styles/ChatInput.module.scss";

/**
 * User input chatbar for sending messages (bottom bar of chat)
 */
export default class ChatInput extends Component {
  render() {
    function handleSend(e) {
      e.preventDefault();
      const msg = document.querySelector("#chat-input").value;
      alert(`Message was sent: ${msg}`);
    }

    return (
      <div className={styles.chat_input_container}>
        <form onSubmit={handleSend} className={styles.chat_form}>
          <input
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
}
