import React, { useState } from "react";
import styles from "./styles/Conversation.module.scss";
import Image from "next/image";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";

// New Conversation Tab
export default function Conversation({
  data,
  status,
  onClick,
  onClose,
  current,
}) {
  const [hover, setHover] = useState(false);

  // Replace with actual seen data
  const seen = false;

  // Replace with actual status data
  const mockStatus = "Requested";

  const lastMsgExists =
    data.lastMessage !== null && data.lastMessage !== undefined;

  // TODO: Check if last message is null and render appropriately

  let lastMsgDate, hours, minutes, ampm, twelveHourHours, lastMsgDateFormatted;

  if (lastMsgExists) {
    lastMsgDate = new Date(data.lastMessage.createTimestamp);
    hours = lastMsgDate.getHours();
    minutes = lastMsgDate.getMinutes().toString().padStart(2, '0');
    ampm = hours >= 12 ? 'PM' : 'AM';
    twelveHourHours = hours % 12 || 12;
    lastMsgDateFormatted = `${twelveHourHours}:${minutes} ${ampm}`;
  }

  function getContainerClassname() {
    if (current) {
      if (!mockStatus) {
        return `${styles.container} ${styles.highlight_container}`;
      } else {
        return `${styles.container_wstatus} ${styles.highlight_container}`;
      }
    } else {
      if (!mockStatus) {
        return styles.container;
      } else {
        return styles.container_wstatus;
      }
    }
  }

  function closeConversation(e) {
    e.stopPropagation();
  }

  return (
    <button
      // TODO: change classname to getContainerClassname()
      className={getContainerClassname()}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      onClick={() => onClick()}
    >
      <div className={styles.left_col}>
        <div className={styles.profile_picture}>
          {/* Change image sizes if css changes */}
          {data.interlocutor.pfpLink ? (
            <img
              src={data.interlocutor.pfpLink}
              width={65}
              height={65}
              alt={`${data.interlocutor.username}'s profile icon`}
            />
          ) : (
            <Image
              src="/corn.jpg"
              width={65}
              height={65}
              alt={`${data.interlocutor.username}'s profile icon`}
            />
          )}
        </div>
        <div
          className={
            !mockStatus ? styles.recipient_info : styles.recipient_info_wstatus
          }
        >
          <h2 className={styles.name} title={data.interlocutor.username}>
            {data.interlocutor.username}
          </h2>
          {lastMsgExists ? (
            <p
              className={
                seen
                  ? styles.last_message
                  : `${styles.last_message} ${styles.unseen}`
              }
              title={data.lastMessage.content}
            >
              {data.lastMessage.content}
            </p>
          ) : (
            <p className={`${styles.last_message} ${styles.new_convo_last_message}`}>Send the first message!</p>
          )}

          {/* TODO: Render status color based on status */}
          {!!mockStatus && (
            <div className={styles.orange_status_container}>
              <div className={styles.status_dot} />
              <div className={styles.status_text}>{"Requested"}</div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.right_col}>
        <div className={styles.timestamp}>{lastMsgDateFormatted}</div>
        {/* TODO: Render notification ping (1) if unread */}
        {hover ? (
          // TODO: Make this close conversation
          <div className={styles.close} onClick={(e) => closeConversation(e)}>
            <CloseRoundedIcon />
          </div>
        ) : !seen ? (
          <div className={styles.notification_container}>
            <div className={styles.notification_dot} />
          </div>
        ) : (
          <div className={styles.view}>
            <NavigateNextRoundedIcon />
          </div>
        )}
      </div>
    </button>
  );
}
