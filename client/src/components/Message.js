import React, { Component } from 'react'
import PropTypes from 'prop-types';
import "./Message.scss";

export default class Message extends Component {
  render() {
    const content = this.props.content;
    const who = this.props.who;     // testing, 0 - other user, 1 - you, 2 - system

    // If message belongs to other user
    if (who === 0) {
      return (
        <div className="their-message-bubble">{content}</div>
      )
    }
    if (who === 1) {
      return (
        <div className="my-message-bubble">{content}</div>
      )
    }
    if (who === 2) {
      return (
        <div className="system-message">{content}</div>
      )
    }
  }
}

Message.propTypes = {
  content: PropTypes.string.isRequired,
};
