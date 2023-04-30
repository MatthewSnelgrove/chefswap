import React, { Component } from "react";
import Avatar from "./Avatar";
import Username from "./Username";
import ChatInteract from "./ChatInteract";
import "./styles/ChatHeader.scss";

/**
 * Container component for chat status bar/header
 * @use Avatar, Username, ChatInteract
 */
export default class ChatHeader extends Component {
  render() {
    return (
      <div className="chat-header">
        <div className="chat-user-info">
          <Avatar size={40} />
          <Username size={25} username="Matthew Snelgrove" />
        </div>

        <ChatInteract status={1} />
      </div>
    );
  }
}
