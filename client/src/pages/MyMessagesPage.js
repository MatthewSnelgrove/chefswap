import React from 'react';
import ConversationContainer from '../components/ConversationContainer';
import MessageSwapSwitch from '../components/MessageSwapSwitch';
import "./styles/MyMessagesPage.scss";

function MyMessagesPage() {
  return (
    <>
      <div className="d-flex justify-content-end mb-2">
        <MessageSwapSwitch current={1} />
      </div>
      <ConversationContainer />
    </>
  );
}

export default MyMessagesPage