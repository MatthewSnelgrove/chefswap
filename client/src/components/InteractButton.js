import React, { Component } from 'react';
import PropTypes from 'prop-types';
import "./InteractButton.scss";

export default class InteractButton extends Component {
  render() {
    const text = this.props.text;
    const color = this.props.color;
    const onClick = this.props.onClick;

    return (
      <button className="interact-btn" onClick={onClick} style={{ backgroundColor: color }}>
        {text}
      </button>
    )
  }
}

InteractButton.propTypes = {
  text: PropTypes.string,
  color: PropTypes.string,
  onClick: PropTypes.func,
};

InteractButton.defaultProps = {
  text: "Button",
  color: "rgb(255,229,208)",
  onClick: () => { alert("Button pressed"); },
};
