import React, { Component } from 'react';
import PropTypes from 'prop-types';
import "./Username.scss";

export default class Username extends Component {
  render() {
    const size = this.props.size;
    const username = this.props.username;

    return (
      <div className="username-container" style={{ fontSize: size }}>{username}</div>
    )
  }
}

Username.propTypes = {
  username: PropTypes.string.isRequired,
  size: PropTypes.number,
};

Username.defaultProps = {
  size: 16,
};
