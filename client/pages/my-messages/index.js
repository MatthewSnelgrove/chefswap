import React from "react";
import OnlyLoggedIn from "../../components/OnlyLoggedIn";
import Head from "next/head";
import styles from "../../styles/MyMessagesPage.module.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import Image from "next/image";
import CheckIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

function MyMessagesPage() {
  // TODO: Add notification to webpage title (e.g., (1) Chefswap | Messages)
  return (
    <>
      <Head>
        <title>Chefswap | My Messages</title>
      </Head>

      <OnlyLoggedIn>
        <div className={styles.container}>
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
              {/* TODO: Populate with conversation data */}
            </div>
          </div>

          <div className={styles.content}>
            <div className={styles.content_header}>
              <div className={styles.recipient_row}>
                <div className={styles.recipient_info}>
                  <div className={styles.recipient_photo}>
                    {/* Change image sizes if container css changes */}
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
                    <CloseRoundedIcon sx={{ color: "white", fontSize: 21 }} />
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
