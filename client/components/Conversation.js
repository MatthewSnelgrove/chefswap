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

  // Replace with actual current data
  current = false;

  // Replace with actual status data
  const mockStatus = "Requested";

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
      className={getContainerClassname()}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      // onClick={() => onClick()}
    >
      <div className={styles.left_col}>
        <div className={styles.profile_picture}>
          {/* Change image sizes if css changes */}
          <Image src="/corn.jpg" width={65} height={65} alt="corn" />
        </div>
        <div
          className={
            !mockStatus ? styles.recipient_info : styles.recipient_info_wstatus
          }
        >
          <h2 className={styles.name} title="User0sd awudui whiusa">
            {"User0sd awudui whiusa"}
          </h2>
          {/* TODO: Render bold depending on read or not */}
          <p
            className={styles.last_message}
            title="Lorem ipsum dolor swiu sd wdahduhd W DAIW H SUH D"
          >
            {
              "Okdjnhadohawdsdadasdsadasoiwa doiaidaodasd as dasd  s sa das d s d "
            }
          </p>
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
        <div className={styles.timestamp}>{"11:59 PM"}</div>
        {/* TODO: Render notification ping (1) if unread */}
        {hover ? (
          // TODO: Make this close conversation
          <button
            className={styles.close}
            onClick={(e) => closeConversation(e)}
          >
            <CloseRoundedIcon />
          </button>
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
