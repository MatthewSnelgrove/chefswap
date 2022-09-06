import React, { Component } from 'react'
import Message from './Message'

export default class Chatbox extends Component {
  render() {
    return (
      <div>
        <Message content="ok i pull up" who={0} />
      </div>
    )
  }
}
