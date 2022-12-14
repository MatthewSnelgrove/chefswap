import React, { Component } from "react";
import ChatContent from "./ChatContent";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import "./styles/Chatbox.scss";

/**
 * Container component for entire chatting section of /my-messages
 * @use ChatHeader, ChatContent, ChatInput
 */
export default class Chatbox extends Component {
  render() {
    return (
      <div style={{ flex: 2 }} className="chatbox">
        <ChatHeader />
        <ChatContent />
        <ChatInput />
      </div>
    );
  }
}
