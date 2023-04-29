import React, { Component } from "react";
import Avatar from "./Avatar";
import Username from "./Username";
import ChatInteract from "./ChatInteract";
import styles from "./styles/ChatHeader.module.scss";

/**
 * Container component for chat status bar/header
 * @use Avatar, Username, ChatInteract
 */
export default class ChatHeader extends Component {
  render() {
    return (
      <div className={styles.chat_header}>
        <div className={styles.chat_user_info}>
          <Avatar size={40} />
          <Username username="Matthew Snelgrove" />
        </div>

        <ChatInteract status={1} />
      </div>
    );
  }
}
