import React, { Component } from 'react'
import PropTypes from 'prop-types';
import "./Message.scss";

export default class Message extends Component {
  render() {
    const content = this.props.content;
    const who = this.props.who;     // testing, 0 - other user, 1 - you, 2 - system

    let msg = (<div>Empty</div>);
    let rowStyle = {};

    // If message belongs to other user
    if (who === 0) {
      msg = (
        <div className="their-message-bubble">{content}</div>
      );
      rowStyle.justifyContent = "left";
    }
    if (who === 1) {
      msg = (
        <div className="my-message-bubble">{content}</div>
      );
      rowStyle.justifyContent = "right";
    }
    if (who === 2) {
      msg = (
        <div className="system-message">{content}</div>
      )
      rowStyle.justifyContent = "center";
    }

    return (
      <div className="message-row" style={rowStyle}>
        {msg}
      </div>
    );
  }
}

Message.propTypes = {
  content: PropTypes.string.isRequired,
};
