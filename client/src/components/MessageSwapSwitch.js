import React, { Component } from "react";
import PropTypes from "prop-types";
import "./styles/MessageSwapSwitch.scss";

export default class MessageSwapSwitch extends Component {
  render() {
    const current = this.props.current;
    if (current === 0) {
      return (
        <div className="switch-button-container">
          <a href="./my-swaps">
            <button
              className="my-swaps-link"
              style={{ backgroundColor: "#ffdfd3" }}
              title="Go to My Swaps"
            >
              <span className="material-icons-round">sync_alt</span>
            </button>
          </a>
          <a href="./my-messages">
            <button className="my-convos-link" title="Go to My Conversations">
              <span className="material-icons-round">chat</span>
            </button>
          </a>
        </div>
      );
    }
    if (current === 1) {
      return (
        <div className="switch-button-container">
          <a href="./my-swaps">
            <button className="my-swaps-link" title="Go to My Swaps">
              <span className="material-icons-round">sync_alt</span>
            </button>
          </a>
          <a href="./my-messages">
            <button
              className="my-convos-link"
              style={{ backgroundColor: "#ffdfd3" }}
              title="Go to My Conversations"
            >
              <span className="material-icons-round">chat</span>
            </button>
          </a>
        </div>
      );
    }
  }
}

MessageSwapSwitch.propTypes = {
  current: PropTypes.number,
};

MessageSwapSwitch.defaultProps = {
  current: 0,
};
