import React from "react";
import ConversationContainer from "../components/ConversationContainer";
import MessageSwapSwitch from "../components/MessageSwapSwitch";
import OnlyLoggedIn from "../components/OnlyLoggedIn";

function MyMessagesPage() {
  return (
    <>
      <OnlyLoggedIn >
        <div className="d-flex justify-content-end mb-2" style={{ marginTop: "70px" }}>
          <MessageSwapSwitch current={1} />
        </div>
        <ConversationContainer />
      </OnlyLoggedIn>
    </>
  );
}

export default MyMessagesPage;
