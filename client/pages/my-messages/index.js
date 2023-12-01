import React from "react";
import OnlyLoggedIn from "../../components/OnlyLoggedIn";
import Conversation from "../../components/Conversation";
import Head from "next/head";
import styles from "../../styles/MyMessagesPage.module.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import Image from "next/image";
import CheckIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

function MyMessagesPage() {
  // Mock message data in the format: {content: string, createTimestamp: string, editTimestamp: string | null}
  const mockMessages = [
    {
      content: "Hello!",
      createTimestamp: "2021-10-01T00:00:00.000Z",
      editTimestamp: null,
    },
    {
      content: "Hi!",
      createTimestamp: "2021-10-01T00:00:00.000Z",
      editTimestamp: null,
    },
    {
      content: "How are you?",
      createTimestamp: "2021-10-01T00:00:00.000Z",
      editTimestamp: null,
    },
    {
      content: "Good, you?",
      createTimestamp: "2021-10-01T00:00:00.000Z",
      editTimestamp: null,
    },
    {
      content: "I'm good too!",
      createTimestamp: "2021-10-01T00:00:00.000Z",
      editTimestamp: null,
    },
  ];

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
              <Conversation />
              <Conversation />
            </div>
          </div>

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
                    <Image src="/corn.jpg" width={55} height={55} />
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

            <div className={styles.messages_area}></div>

            <div className={styles.input_container}>
              <button className={styles.add_media_button}>
                <AddRoundedIcon sx={{ color: "#5A5A5A", fontSize: 45 }} />
              </button>
              <div className={styles.input_section}>
                <div className={styles.input_context}>
                  {/* TODO: Render conditionally */}
                  <div className={styles.input_context_text}>
                    Replying to{" "}
                    <span className={styles.context_user}>User0</span>
                  </div>
                  {/* TODO: Make this button close the chat context */}
                  <button className={styles.input_context_close}>
                    <CloseRoundedIcon sx={{ color: "white", fontSize: 18 }} />
                  </button>
                </div>
                <input
                  className={styles.chat_input}
                  type="text"
                  placeholder="Send a message..."
                />
              </div>
              <button className={styles.send_button}>
                <SendRoundedIcon sx={{ color: "white", fontSize: 35 }} />
              </button>
            </div>
          </div>
        </div>
      </OnlyLoggedIn>
    </>
  );
}

export default MyMessagesPage;
