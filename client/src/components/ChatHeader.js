import React, { Component } from 'react';
import Avatar from './Avatar';
import Username from './Username';
import ChatInteract from './ChatInteract';
import "./ChatHeader.scss";

export default class ChatHeader extends Component {
  render() {
    return (
      <div className="chat-header">
        <div className="chat-user-info">
          <Avatar size={40} />
          <Username username="Matthew Snelgrove" />
        </div>

        <ChatInteract status={1} />
      </div>
    )
  }
}
