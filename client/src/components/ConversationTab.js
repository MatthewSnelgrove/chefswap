import React, { Component } from 'react';
import PropTypes from 'prop-types';
import "./ConversationTab.scss";
import Avatar from "./Avatar";
import Username from "./Username";

export default class ConversationTab extends Component {
  render() {
    const user = this.props.user;      // user json obj from db
    const status = this.props.status;   // testing, 0 - no swap, 1 - pending, 2 - ongoing

    let bc = "transparent";

    if (status === 1) bc = "orange";
    else if (status === 2) bc = "green";

    return (
      <button className="conversation-tab-container">
        <div className="status-bar" style={{
          backgroundColor: `${bc}`,
        }}></div>
        <Avatar />
        <Username username={user.username} />
      </button>
    )
  }
}

ConversationTab.propTypes = {
  status: PropTypes.number,
  user: PropTypes.object,
};

ConversationTab.defaultProps = {
  status: 0,
};
