import React, { Component } from 'react';
import PeopleContainer from "./PeopleContainer";
import "./ConversationContainer.scss";
import Chatbox from './Chatbox';

export default class ConversationContainer extends Component {
  render() {
    return (
      <div className="conversation-container">
        <PeopleContainer />
        <Chatbox />
      </div>
    )
  }
}
