import React, { useState } from "react";
import styles from "./styles/Message2.module.scss";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

// data: {messageUid, interlocutorUid, senderUid, content, createTimestamp, editTimestamp, parentMessageUid}
export default function MessageV2({ data, onReply, onEdit, onDelete }) {
  if (data === null || data === undefined) {
    console.log("MessageV2: message data is null"); // test
    return <></>;
  }

  const [hovering, setHovering] = useState(false);

  const isSender = data.interlocutorUid !== data.senderUid;
  const dateTime = new Date(data.createTimestamp);
  const time = dateTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dateTimeString = dateTime.toLocaleString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return isSender ? (
    // USER'S MESSAGE
    <div
      className={styles.right_container}
      id={`message_${data.messageUid}`}
      onMouseOver={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
    >
      <div
        className={styles.options}
        style={hovering ? { visibility: "visible" } : { visibility: "hidden" }}
      >
        <button className={styles.edit_option}>
          <EditRoundedIcon />
        </button>
        <button className={styles.reply_option}>
          <ReplyRoundedIcon />
        </button>
        <button className={styles.delete_option}>
          <DeleteRoundedIcon />
        </button>
      </div>

      <div className={styles.right}>
        <div
          className={styles.timestamp}
          title={dateTimeString}
          style={
            hovering ? { visibility: "visible" } : { visibility: "hidden" }
          }
        >
          {time}
        </div>

        <div className={styles.right_bubble_column}>
          {data.parentMessageUid !== null && (
            <div className={styles.right_parent_row}>
              {/* TODO: Change reply bubble color based on sender of referenced message */}
              <button className={styles.right_reply_bubble}>
                {/* TODO: Load reply content */}
                <div className={styles.reply_content}>
                  Lorem ipsum daidh ushsds ds d dsa ds
                </div>
              </button>
              <div className={styles.right_reply_line} />
            </div>
          )}

          <div className={styles.right_message_bubble}>
            <div className={styles.right_message_tip} />
            <span className={styles.content}>{data.content}</span>
          </div>

          {data.editTimestamp !== null && (
            <div className={styles.edit_stamp} title={dateTimeString}>
              (edited)
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    // THEIR MESSAGE
    <div
      className={styles.left_container}
      id={`message_${data.messageUid}`}
      onMouseOver={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
    >
      <div className={styles.left}>
        <div className={styles.left_bubble_column}>
          {data.parentMessageUid !== null && (
            <div className={styles.left_parent_row}>
              <div className={styles.left_reply_line} />
              {/* TODO: Change reply bubble color based on sender of referenced message */}
              <button className={styles.left_reply_bubble}>
                {/* TODO: Load reply content */}
                <div className={styles.reply_content}>Reply</div>
              </button>
            </div>
          )}

          <div className={styles.left_message_bubble}>
            <div className={styles.left_message_tip} />
            <div className={styles.content}>{data.content}</div>
          </div>

          {data.editTimestamp !== null && (
            <div className={styles.edit_stamp} title={dateTimeString}>
              (edited)
            </div>
          )}
        </div>

        <div
          className={styles.timestamp}
          title={dateTimeString}
          style={
            hovering ? { visibility: "visible" } : { visibility: "hidden" }
          }
        >
          {time}
        </div>
      </div>

      <div
        className={styles.options}
        style={hovering ? { visibility: "visible" } : { visibility: "hidden" }}
      >
        <button className={styles.reply_option}>
          <ReplyRoundedIcon />
        </button>
      </div>
    </div>
  );
}
