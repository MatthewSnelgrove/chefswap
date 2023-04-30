import React from "react";
import ConversationContainer from "../../components/ConversationContainer";
import MessageSwapSwitch from "../../components/MessageSwapSwitch";
import OnlyLoggedIn from "../../components/OnlyLoggedIn";
import Head from "next/head";

function MyMessagesPage() {
  // TODO: Add notification to webpage title (e.g., (1) Chefswap | Messages)
  return (
    <>
      <Head>
        <title>Chefswap | My Messages</title>
      </Head>

      <OnlyLoggedIn>
        <div
          className="d-flex justify-content-end mb-2"
          style={{ marginTop: "70px" }}
        >
          <MessageSwapSwitch current={1} />
        </div>
        <ConversationContainer />
      </OnlyLoggedIn>
    </>
  );
}

export default MyMessagesPage;
