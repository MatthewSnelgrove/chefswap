import React from "react";
import PeopleContainer from "./PeopleContainer";
import styles from "./styles/ConversationContainer.module.scss";
import Chatbox from "./Chatbox";


/**
 * Container component for entire conversations page (/my-messages)
 * @use PeopleContainer, Chatbox
 */
export default class ConversationContainer extends Component {
  render() {
    return (
      <div className={styles.conversation_flex}>
        <div className={styles.conversation_container}>
          <PeopleContainer />
          <Chatbox />
        </div>
      </div>
    </>
  );
}


export default ConversationContainer;