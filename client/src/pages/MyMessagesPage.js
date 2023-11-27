import React, { useEffect } from "react";
import ConversationContainer from "../components/ConversationContainer";
import MessageSwapSwitch from "../components/MessageSwapSwitch";
import OnlyLoggedIn from "../components/OnlyLoggedIn";
import useMessages from "../utils/useMessages";

function MyMessagesPage() {
  
  const { conversations, useSocketOperation } = useMessages()


  useEffect(() => {
    // TODO: Add notification on title; e.g., (1) Chefswap | Messages
    document.title = "Chefswap | Messages";
  }, []);

  return (
    <>
      <OnlyLoggedIn>
        <div
          className="d-flex justify-content-end mb-2"
          style={{ marginTop: "70px" }}
        >
          {/* <MessageSwapSwitch current={1} /> */}
        </div>
        <ConversationContainer />
      </OnlyLoggedIn>
    </>
  );
}

export default MyMessagesPage;
