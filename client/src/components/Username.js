import React, { Component } from "react";
import PropTypes from "prop-types";
import "./styles/Username.scss";

/**
 * Displays username of user
 * @param size Username text size in px
 * @param username Username
 */
export default class Username extends Component {
  render() {
    const size = this.props.size;
    const username = this.props.username;

    return (
      <div className="username-container">
        {username}
      </div>
    );
  }
}

Username.propTypes = {
  username: PropTypes.string.isRequired,
  size: PropTypes.number,
};

Username.defaultProps = {
  size: 16,
};
