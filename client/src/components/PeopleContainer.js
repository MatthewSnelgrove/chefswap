import React, { Component } from "react";
import ConversationTab from "../components/ConversationTab";
import "./styles/PeopleContainer.scss";

/**
 * Container component for people sidebar in /my-messages
 * @use ConversationTab
 */
export default class PeopleContainer extends Component {
  render() {
    // Mock users
    const user1 = {
      username: "Andre Fong",
    };
    const user2 = {
      username: "Victor Hurst",
    };
    const user3 = {
      username: "Matthew Snelgrove",
    };

    return (
      <div className="people-container">
        <div className="people-heading">Conversations</div>
        <div className="people-list">
          <ConversationTab status={1} user={user1} />
          <ConversationTab status={2} user={user2} />
          <ConversationTab user={user3} />
          <ConversationTab user={user3} />
          <ConversationTab user={user3} />
          <ConversationTab user={user3} />
          <ConversationTab user={user3} />
          <ConversationTab user={user3} />
        </div>
      </div>
    );
  }
}
