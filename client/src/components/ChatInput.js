import React, { Component } from "react";
import "./styles/ChatInput.scss";
import socket from "../utils/socket";
/**
 * User input chatbar for sending messages (bottom bar of chat)
 */
function ChatInput(props) {

    function handleSend(e) {
      e.preventDefault();
      const chatInput = document.querySelector("#chat-input")
      const msg = chatInput.value
      socket.emit(
        "sendUserMessage",
        {
          reveiverUid: "fa4632e6-c4f8-44d4-9408-cfb4f8499d01",
          content: msg,
        },
        (response) => {
          props.setMessages((pastMessages) => [...pastMessages, response])
        }
      );
      chatInput.value = ""
    }

    return (
      <div className="chat-input-container">
        <form onSubmit={handleSend} className="chat-form">
          <input
            type="text"
            id="chat-input"
            placeholder="Send a message"
            autoComplete="off"
          />
          <button type="submit" className="send-btn">
            Send
          </button>
        </form>
      </div>
    );
}

export default ChatInput;
