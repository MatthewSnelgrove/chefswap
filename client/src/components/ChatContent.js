import React, { Component } from 'react'
import Message from './Message';
import "./ChatContent.scss";

/**
 * Container component for all chat messages
 * @use Message
 */
export default class ChatContent extends Component {
  render() {
    return (
      <div className="chat-content">
        <Message content="Hey, how are you?" who={0} />
        <Message content="I'd love to meet up and try your Indian food!" who={0} />
        <Message content="no" who={1} />
        <Message content="MY indian food" who={1} />
        <Message content="Matthew Snelgrove requested to swap with Albert kun!" who={2} />
        <Message content="Albert kun can't swap at this time!" who={2} />
        <Message content="Matthew Snelgrove requested to swap with Albert kun!" who={2} />
        <Message content="Albert kun can't swap at this time!" who={2} />
        <Message content="Matthew Snelgrove requested to swap with Albert kun!" who={2} />
        <Message content="Albert kun can't swap at this time!" who={2} />
        <Message content="Matthew Snelgrove requested to swap with Albert kun!" who={2} />
        <Message content="Albert kun can't swap at this time!" who={2} />
        <Message content="Please?" who={0} />
        <Message content="no" who={1} />
        <Message content="Matthew Snelgrove requested to swap with Albert kun!" who={2} />
        <Message content="Matthew Snelgrove requested to swap with Albert kun!" who={2} />
        <Message content="Matthew Snelgrove requested to swap with Albert kun!" who={2} />
        <Message content="Matthew Snelgrove requested to swap with Albert kun!" who={2} />
        <Message content="Matthew Snelgrove requested to swap with Albert kun!" who={2} />
        <Message content="Matthew Snelgrove requested to swap with Albert kun!" who={2} />
      </div>
    )
  }
}
