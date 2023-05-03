import React from "react";
import PeopleContainer from "./PeopleContainer";
import "./styles/ConversationContainer.scss";
import Chatbox from "./Chatbox";


/**
 * Container component for entire conversations page (/my-messages)
 * @use PeopleContainer, Chatbox
 */
function ConversationContainer(props)  {
  // const socket = io(global.config.server)

  // socket.on("connect", () => {
  //   console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  // });



  return (
    <>
      <div style={{ marginTop: "20px" }} className="conversation-flex">
        <div className="conversation-container">
          <PeopleContainer />
          <Chatbox />
        </div>
      </div>
    </>
  );
}


export default ConversationContainer;