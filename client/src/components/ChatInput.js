import React, { Component } from 'react';
import "./ChatInput.scss";

export default class ChatInput extends Component {
  render() {
    function handleSend(e) {
      e.preventDefault();
      const msg = document.querySelector("#chat-input").value;
      alert(`Message was sent: ${msg}`);
    }

    return (
      <div className="chat-input-container">
        <form onSubmit={handleSend} className="chat-form" >
          <input type="text" id="chat-input" placeholder="Send a message" autoComplete="off" />
          <button type="submit" className="send-btn">Send</button>
        </form>
      </div>
    )
  }
}
