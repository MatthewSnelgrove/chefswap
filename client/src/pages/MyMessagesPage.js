import React from 'react';
import ConversationContainer from '../components/ConversationContainer';
import Navbar from "../components/Navbar";
import "./MyMessagesPage.scss";

function MyMessagesPage() {
  return (
    <>
      <Navbar />
      <ConversationContainer />
    </>
  );
}

export default MyMessagesPage