import React, { useEffect, useState } from "react";
import Typewriter from "../components/Homepage/Typewriter";
import StyledBtn from "../components/Homepage/StyledBtn";
import "./styles/AboutPage.scss";
import useSocketSetup from "../utils/useSocketSetup";
import socket from "../utils/socket";
/**
 * Page at "/"
 */
function TEST_SESSION_PAGE() {
  useEffect(() => {
    document.title = "Chefswap | Home";
  }, []);
  useSocketSetup();

  const sendUserMessage = () => {
    socket.emit(
      "sendUserMessage",
      {
        reveiverUid: "fa4632e6-c4f8-44d4-9408-cfb4f8499d01",
        content: "test message",
      },
      (response) => {
        console.log(response);
      }
    );
  };
  socket.on("receiveUserMessage", (message) => {
    console.log(message);
  });

  return (
    <>
      <div className="TEST_SESSION_PAGE">
        <main className="intro-main">
          <h1 className="about-header">
            <Typewriter arr={["Connect", "Meet", "Cook", "Eat"]} />
            with talented <br></br> chefs of every level.
          </h1>
          <div className="about-blurb">
            Chefswap helps users across Canada connect with each other through a
            love for cooking and eating!
          </div>
          <button onClick={sendUserMessage}>Send Message</button>
        </main>
      </div>
      <body>this is text</body>

      <div className="product-demo-section"></div>
    </>
  );
}

export default TEST_SESSION_PAGE;
