import React, { Component } from "react";
import ConversationTab from "../components/ConversationTab";
import styles from "./styles/PeopleContainer.module.scss";

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
      <div className={styles.people_container}>
        <div className={styles.people_heading}>Conversations</div>
        <div className={styles.people_list}>
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
