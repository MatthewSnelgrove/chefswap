import React, { Component } from 'react';
import PeopleContainer from "./PeopleContainer";
import "./styles/ConversationContainer.scss";
import Chatbox from './Chatbox';

/**
 * Container component for entire conversations page (/my-messages)
 * @use PeopleContainer, Chatbox
 */
export default class ConversationContainer extends Component {
  render() {
    return (
      <div className="conversation-flex">
        <div className="conversation-container">
          <PeopleContainer />
          <Chatbox />
        </div>
      </div>
    )
  }
}
