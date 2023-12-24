import React, { Component } from "react";
import { useUser } from "./useUser";
import Message from "./Message";
import styles from "./styles/ChatContent.module.scss";

/**
 * Container component for all chat messages
 * @use Message
 */
function ChatContent(props) {
  const user = useUser();
  const globalVars = global.config;

  if (user == globalVars.userStates.loading) {
    return <></>;
  }

  const messagesHTML = props.messages.map((message) => {
    return (
      <Message
        content={message.content}
        who={user.accountUid == message.senderUid ? 1 : 0}
      />
    );
  });

  return (
    <div className={styles.chat_content}>
      <Message content="Hey, how are you?" who={0} />
      <Message
        content="I'd love to meet up and try your Indian food!"
        who={0}
      />
      <Message content="no" who={1} />
      <Message content="MY indian food" who={1} />
      <Message
        content="Matthew Snelgrove requested to swap with Albert kun!"
        who={2}
      />
      <Message content="Albert kun can't swap at this time!" who={2} />
      <Message
        content="Matthew Snelgrove requested to swap with Albert kun!"
        who={2}
      />
      <Message content="Albert kun can't swap at this time!" who={2} />
      <Message
        content="Matthew Snelgrove requested to swap with Albert kun!"
        who={2}
      />
      <Message content="Albert kun can't swap at this time!" who={2} />
      <Message
        content="Matthew Snelgrove requested to swap with Albert kun!"
        who={2}
      />
      <Message content="Albert kun can't swap at this time!" who={2} />
      <Message content="Please?" who={0} />
      <Message content="no" who={1} />
      <Message
        content="Matthew Snelgrove requested to swap with Albert kun!"
        who={2}
      />
      <Message
        content="Matthew Snelgrove requested to swap with Albert kun!"
        who={2}
      />
      <Message
        content="Matthew Snelgrove requested to swap with Albert kun!"
        who={2}
      />
      <Message
        content="Matthew Snelgrove requested to swap with Albert kun!"
        who={2}
      />
      <Message
        content="Matthew Snelgrove requested to swap with Albert kun!"
        who={2}
      />
      <Message
        content="Matthew Snelgrove requested to swap with Albert kun!"
        who={2}
      />{" "}
      */}
      {messagesHTML}
    </div>
  );
}

export default ChatContent;
