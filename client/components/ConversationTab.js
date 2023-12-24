import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "./styles/ConversationTab.module.scss";
import Avatar from "./Avatar";
import Username from "./Username";

/**
 * Selectable message tab of a user's chat (similar to discord convos)
 * @param user Temporary user json object (user.username: string)
 * @param status 0: no swap, 1: pending swap, 2: ongoing swap
 * @use Avatar, Username
 */
export default class ConversationTab extends Component {
  render() {
    const user = this.props.user; // user json obj from db
    return (
      <button className={styles.conversation_tab_container}>
        <div
          className={styles.status_bar}
          style={{
            backgroundColor: `${bc}`,
          }}
        ></div>
        <Avatar />
        <Username username={user.username} />
      </button>
    );
  }
}

ConversationTab.propTypes = {
  status: PropTypes.number,
  user: PropTypes.object,
};

ConversationTab.defaultProps = {
  status: 0,
};
