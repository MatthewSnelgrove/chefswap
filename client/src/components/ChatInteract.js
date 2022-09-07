import React, { Component } from 'react'
import InteractButton from './InteractButton';
import PropTypes from "prop-types";

export default class ChatInteract extends Component {
  render() {
    const status = this.props.status;   // 0 - no swap, 1 - swap pending, 2 - swap ongoing
    let btn = (<InteractButton />);

    if (status === 0) {
      btn = (<InteractButton text="Swap!" />);
    }
    if (status === 1) {
      btn = (
        <div>
          <InteractButton text="Accept" color="aquamarine" />
          <InteractButton text="Not now" color="lightcoral" />
        </div>
      );

    }
    if (status === 2) {
      btn = (<InteractButton text="Finish!" color="#dffff4" />);
    }

    return btn;
  }
}

ChatInteract.propTypes = {
  status: PropTypes.number,
};

ChatInteract.defaultProps = {
  status: 0,
};
