import React, { Component } from 'react';
import ChatContent from "./ChatContent";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import "./Chatbox.scss";

export default class Chatbox extends Component {
  render() {
    return (
      <div style={{ flex: 2 }} className="chatbox">
        <ChatHeader />
        <ChatContent />
        <ChatInput />
      </div>
    )
  }
}
