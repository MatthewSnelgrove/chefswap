import React, { useState, useEffect, useCallback } from "react";
import OnlyLoggedIn from "../../components/OnlyLoggedIn";
import Conversation from "../../components/Conversation";
import Head from "next/head";
import styles from "../../styles/MyMessagesPage.module.scss";
import msgStyles from "../../components/styles/Message2.module.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import Image from "next/image";
import CheckIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MessageV2 from "../../components/Message2";
import { useUser } from "../../components/useUser";
import Link from "next/link";
import useMessages from "../../utils/useMessages";
import useSocketSetup from "../../utils/useSocketSetup";
import CircularProgress from "@mui/material/CircularProgress";

function MyMessagesPage() {
  // USER DATA
  const user = useUser();

  /*********** CONVERSATION DATA ***********/

  const [conversationsLoading, setConversationsLoading] = useState(true);

  // Mock conversation data in the format: {messager: string, lastMessage: string}
  const mockConversations = [
    {
      messager: "User0",
      lastMessage: "Lorem ipsum",
    },
    {
      messager: "User1",
      lastMessage: "Lorem ipsum",
    },
    {
      messager: "User2",
      lastMessage: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      messager: "User3",
      lastMessage: "Lorem ipsum",
    },
    {
      messager: "User4",
      lastMessage: "Lorem ipsum",
    },
  ];

  /**
   * CURRENT SELECTED CONVERSATION
   * Current selected user conversation data (INTERLOCUTOR)
   */
  const [currentConversation, setCurrentConversation] = useState(null);

  function handleConversationClick(interlocutorUid) {
    setCurrentConversation(interlocutorUid);
  }

  useSocketSetup();

  const { conversations, messages, useSocketOperation } = useMessages(
    currentConversation,
    20
  );

  useEffect(() => {
    // console.log(messages);
  }, [messages]);

  // Once conversations are loaded, set the first conversation as the current conversation
  useEffect(() => {
    if (conversations !== null && conversations.length > 0) {
      setCurrentConversation(conversations[0].interlocutor.accountUid);
    }
  }, [conversations]);

  // Once messages are loaded, scroll down to the bottom of the messages area
  useEffect(() => {
    const messageArea = document.querySelector(`.${styles.messages_area}`);
    if (messageArea) {
      messageArea.scrollTop = messageArea.scrollHeight;
    }
  }, [messages]);

  // TEST JOINING CONVO
  // useEffect(() => {
  //   useSocketOperation("joinConversation", {interlocutorUid: "9405b073-70ee-4a5d-a2bd-dbfc3709846c"}, () => {})
  // }, [])

  /**
   * CHAT STATE
   * 0 - chatting
   * 1 - replying to msg
   * 2 - editing your msg
   */
  const [chatState, setChatState] = useState(0);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") {
        // TODO: bug where clear chat state clears text even if user is not editing
        clearChatState();
      }
    }
    const messageArea = document.querySelector(`.${styles.messages_area}`);

    if (chatState !== 0) {
      // Allow user to press escape to stop replying or editing
      window.addEventListener("keydown", handleEsc);
      // Add padding to let user notice layout shift
      messageArea.style.paddingBottom = "50px";
      messageArea.scrollBy(0, 20);
    } else {
      if (messageArea) {
        messageArea.scrollBy(0, -20);
        messageArea.style.paddingBottom = "30px";
      }
    }
    return () => window.removeEventListener("keydown", handleEsc, true);
  }, [chatState]);

  /**
   * SELECTED MESSAGE STATE
   * Selected message being edited or replied to (message data)
   */
  const [selectedMessage, setSelectedMessage] = useState(null);

  /**
   * Handles when a message is selected (being edited or replied to)
   */
  function handleSelectedMessageChange(messageData) {
    const oldMessage = document.getElementById(
      `message_${selectedMessage?.messageUid}`
    );
    const newMessage = document.getElementById(
      `message_${messageData?.messageUid}`
    );

    // Remove old message's selected style
    if (oldMessage) {
      oldMessage.classList.remove(msgStyles.selected_message_container);
    }

    if (!newMessage) return;
    setSelectedMessage(messageData);

    // Add new message's selected style
    newMessage.classList.add(msgStyles.selected_message_container);
  }

  /**
   * Clears chat state and selected message
   */
  function clearChatState() {
    if (chatState === 2) setChatText("");
    setChatState(0);
    handleSelectedMessageChange(null);
  }

  /**
   * Sends a chat message (not reply or edit) and clear chat text
   */
  function sendChat() {
    useSocketOperation(
      "sendMessage",
      {
        content: chatText,
        interlocutorUid: currentConversation,
      },
      () => {}
    );
  }

  /**
   * Starts replying to a message and updates chat state accordingly
   */
  function startReplying(parentMessageData) {
    if (chatState === 2) setChatText("");
    setChatState(1);
    handleSelectedMessageChange(parentMessageData);

    // Scroll textbar to rightmost, focus textbar
    const chatInput = document.querySelector(`.${styles.chat_input}`);
    chatInput.scrollLeft = chatInput.scrollWidth;
    chatInput.focus();
  }

  function sendReply() {
    useSocketOperation(
      "sendMessage",
      {
        content: chatText,
        interlocutorUid: currentConversation,
        parentMessageUid: selectedMessage.messageUid,
      },
      () => {}
    );
  }

  /**
   * Starts editing a message and updates chat state accordingly
   */
  function startEditing(parentMessageData) {
    if (parentMessageData.senderUid === parentMessageData.interlocutorUid) {
      console.log("Cannot edit other user's message"); // TODO: REMOVE AFTER TESTING
      return;
    }
    setChatState(2);
    handleSelectedMessageChange(parentMessageData);
    setChatText(parentMessageData.content);

    // Scroll textbar to rightmost, focus textbar
    const chatInput = document.querySelector(`.${styles.chat_input}`);
    chatInput.scrollLeft = chatInput.scrollWidth;
    chatInput.focus();
  }

  function sendEdit() {
    useSocketOperation(
      "editMessage",
      {
        content: chatText,
        messageUid: selectedMessage.messageUid,
      },
      () => {}
    );
  }

  function startDeleting(parentMessageData) {
    if (parentMessageData.senderUid === parentMessageData.interlocutorUid) {
      console.log("Cannot delete other user's message"); // TODO: REMOVE AFTER TESTING
      return;
    }
    // TODO: Render confirmation popup?
  }

  function deleteMessage(parentMessageData) {
    // TODO: Implement with Socket
  }

  // Chat bar text
  const [chatText, setChatText] = useState("");

  // Handle chat text change
  function handleChatTextChange(e) {
    setChatText(e.target.value);
  }

  /**
   * Handles when user clicks send button
   */
  function handleSend(e) {
    e.preventDefault();

    if (chatText === "" || chatText.length > 300) return;

    // SEND CHAT
    if (chatState === 0) {
      sendChat();
    }
    // SEND REPLY
    else if (chatState === 1) {
      sendReply();
    }
    // SEND EDIT
    else if (chatState === 2) {
      sendEdit();
    }
    clearChatState();
    setChatText("");
  }

  // TODO: Add notification to webpage title (e.g., (1) Chefswap | Messages)
  return (
    <>
      <Head>
        <title>Chefswap | My Messages</title>
      </Head>

      <OnlyLoggedIn>
        <div className={styles.container}>
          {/* TODO: Make sidebar a drawer when screen too small */}
          <div className={styles.sidebar}>
            <div className={styles.sidebar_header}>
              <div className={styles.title_row}>
                <h1 className={styles.title}>Messages</h1>
                <button className={styles.options}>
                  <MoreVertIcon fontSize="large" />
                </button>
              </div>
              <div className={styles.search}>
                {/* TODO: Search for user should filter users */}
                <input
                  className={styles.search_input}
                  type="text"
                  placeholder="Search for a user..."
                />
                <div className={styles.search_icon}>
                  <SearchIcon />
                </div>
              </div>
            </div>

            <div className={styles.conversations}>
              {conversations === null ? (
                <div className={styles.conversation_loading}>
                  <CircularProgress />
                </div>
              ) : (
                conversations.map((convo) => (
                  <Conversation
                    data={convo}
                    key={convo.interlocutor.accountUid}
                    current={
                      convo.interlocutor.accountUid === currentConversation
                    }
                    onClick={() =>
                      handleConversationClick(convo.interlocutor.accountUid)
                    }
                  />
                ))
              )}
            </div>
          </div>

          {/* CHAT HEADER + MESSAGES */}
          <div className={styles.content}>
            <div className={styles.content_header}>
              <div className={styles.recipient_row}>
                <div className={styles.recipient_info}>
                  {/* TODO: Make this toggle drawer */}
                  <button className={styles.toggle_recipients_drawer}>
                    <MenuRoundedIcon fontSize="large" />
                  </button>
                  <div className={styles.recipient_photo}>
                    {/* Change image sizes if css changes */}
                    {/* TODO */}
                    <Image src="/corn.jpg" width={55} height={55} alt="corn" />
                  </div>
                  <h2 className={styles.recipient_name}>Corn</h2>
                </div>
                <button className={styles.recipient_more_options}>
                  <MoreVertIcon fontSize="large" />
                </button>
              </div>

              <div className={styles.swap_request}>
                {/* TODO: Make this render conditionally based on whether or not there is a request */}
                <div className={styles.swap_graphic_text}>
                  <div className={styles.swap_graphic}>(graphic)</div>
                  <div className={styles.swap_text}>
                    {/* TODO: Render name properly */}
                    <span className={styles.swap_requester}>Corn </span>
                    requested to swap with you
                  </div>
                </div>
                <div className={styles.swap_options}>
                  <button className={styles.swap_accept}>
                    <CheckIcon sx={{ color: "white", fontSize: 30 }} />
                  </button>
                  <button className={styles.swap_decline}>
                    <CloseRoundedIcon sx={{ color: "white", fontSize: 30 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* MESSAGES AREA */}
            {conversations !== null && conversations.length === 0 ? (
              <div className={styles.no_conversation_area}>
                <div className={styles.nc_graphic}>
                  <Image src="/sad_chef_hat.webp" width={200} height={200} alt="Sad Chefswap logo" />
                </div>
                <div className={styles.nc_text}>
                  Looks like there are no conversations.
                  <br />
                  <span className={styles.nc_link}>
                    <Link href="/find-swap">Find a swap</Link>
                  </span>{" "}
                  to start chatting!
                </div>
              </div>
            ) : (
              <>
                <div className={styles.messages_area}>
                  {/* TODO: Render loading skeleton if messages are not loaded */}
                  {/* TODO: If no messages in conversation, render no messages text */}
                  {/* TODO: Infinite scroll */}

                  {messages !== null ? (
                    messages
                      .slice(0)
                      .reverse()
                      .map((msg) => (
                        <MessageV2
                          data={msg}
                          onEdit={startEditing}
                          onReply={startReplying}
                          onDelete={startDeleting}
                          key={msg.message.messageUid}
                          userUid={user.accountUid}
                        />
                      ))
                  ) : (
                    <div className={styles.messages_loading}>
                      <CircularProgress />
                    </div>
                  )}
                </div>

                <form className={styles.input_container} onSubmit={handleSend}>
                  <button className={styles.add_media_button}>
                    <AddRoundedIcon sx={{ color: "#5A5A5A", fontSize: 45 }} />
                  </button>
                  <div className={styles.input_section}>
                    {chatState !== 0 && (
                      <div className={styles.input_context}>
                        <div className={styles.input_context_text}>
                          {chatState === 0 && ""}
                          {chatState === 1 && "Replying to: "}
                          {chatState === 2 && "Editing message: "}
                          {/* TODO: Render context name conditionally */}
                          <span className={styles.context_user}>User0</span>
                        </div>
                        <button
                          className={styles.input_context_close}
                          onClick={() => clearChatState()}
                        >
                          <CloseRoundedIcon
                            sx={{ color: "white", fontSize: 18 }}
                          />
                        </button>
                      </div>
                    )}

                    <input
                      className={styles.chat_input}
                      type="text"
                      placeholder="Send a message..."
                      value={chatText}
                      onChange={handleChatTextChange}
                    />
                  </div>
                  <button className={styles.send_button} onClick={handleSend}>
                    <SendRoundedIcon sx={{ color: "white", fontSize: 35 }} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </OnlyLoggedIn>
    </>
  );
}

export default MyMessagesPage;
