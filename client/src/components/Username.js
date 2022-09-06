import React, { Component } from 'react';
import PropTypes from 'prop-types';
import "./Username.scss";

export default class Username extends Component {
  render() {
    const size = this.props.size;

    return (
      <div className="username-container" style={{ fontSize: size }}>{this.props.username}</div>
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
