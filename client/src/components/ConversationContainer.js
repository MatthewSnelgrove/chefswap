import React, { Component } from "react";
import PeopleContainer from "./PeopleContainer";
import "./styles/ConversationContainer.scss";
import Chatbox from "./Chatbox";
const { io } = require("socket.io-client");
/**
 * Container component for entire conversations page (/my-messages)
 * @use PeopleContainer, Chatbox
 */
export default class ConversationContainer extends Component {
  render() {
    const socket = io(global.config.server)

    socket.on("connect", () => {
      console.log(socket.id); // x8WIv7-mJelg7on_ALbx
    });
    

    return (
      <div className="conversation-flex">
        <div className="conversation-container">
          <PeopleContainer />
          <Chatbox />
        </div>
      </div>
    );
  }
}
