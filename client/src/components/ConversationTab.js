import React, { Component } from "react";
import PropTypes from "prop-types";
import "./styles/ConversationTab.scss";
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
      <button className="conversation-tab-container">
        <div
          className="status-bar"
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
