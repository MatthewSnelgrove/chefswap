import React, { useState } from "react";
import styles from "./styles/Message2.module.scss";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

/*
data = {
  messages:
  {
    message: {
      messageUid,
      interlocutorUid,
      senderUid,
      content,
      createTimestamp,
      editTimestamp,
    },
    parentMessage: {
      messageUid,
      interlocutorUid,
      senderUid,
      content,
      createTimestamp,
      editTimestamp,
      parentMessageUid,
    },
  }
}

*/
export default function MessageV2({ data, onReply, onEdit, onDelete, userUid }) {
  const [hovering, setHovering] = useState(false);
  
  const message = data.message;
  const parentMessage = data.parentMessage;

  const isSender = userUid === message.senderUid;
  const dateTime = new Date(message.createTimestamp);
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

  const editDateTime = new Date(message.editTimestamp);
  const editTimeString = editDateTime.toLocaleTimeString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (data === null || data === undefined) {
    console.log("MessageV2: message data is null"); // test
    return <></>;
  }

  return isSender ? (
    // USER'S MESSAGE
    <div
      className={styles.right_container}
      id={`message_${message.messageUid}`}
      onMouseOver={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
    >
      <div
        className={styles.options}
        style={hovering ? { visibility: "visible" } : { visibility: "hidden" }}
      >
        <button className={styles.edit_option} onClick={() => onEdit(message)}>
          <EditRoundedIcon />
        </button>
        <button className={styles.reply_option} onClick={() => onReply(message)}>
          <ReplyRoundedIcon />
        </button>
        <button className={styles.delete_option} onClick={() => onDelete(message)}>
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
          {parentMessage && (
            <div className={styles.right_parent_row}>
              {/* TODO: Change reply bubble color based on sender of referenced message */}
              {/* TODO: Clicking reply should jump to parent message */}
              <button className={styles.right_reply_bubble}>
                <div className={styles.reply_content}>
                  {parentMessage.content}
                </div>
              </button>
              <div className={styles.right_reply_line} />
            </div>
          )}

          <div className={styles.right_message_bubble}>
            <div className={styles.right_message_tip} />
            <span className={styles.content}>{message.content}</span>
          </div>

          {message.editTimestamp && (
            <div className={styles.edit_stamp} title={editTimeString}>
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
      id={`message_${message.messageUid}`}
      onMouseOver={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
    >
      <div className={styles.left}>
        <div className={styles.left_bubble_column}>
          {parentMessage !== null && (
            <div className={styles.left_parent_row}>
              <div className={styles.left_reply_line} />
              {/* TODO: Change reply bubble color based on sender of referenced message */}
              <button className={styles.left_reply_bubble}>
                <div className={styles.reply_content}>
                  {parentMessage.content}
                </div>
              </button>
            </div>
          )}

          <div className={styles.left_message_bubble}>
            <div className={styles.left_message_tip} />
            <div className={styles.content}>{message.content}</div>
          </div>

          {message.editTimestamp && (
            <div className={styles.edit_stamp} title={editTimeString}>
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
        <button className={styles.reply_option} onClick={() => onReply(message)}>
          <ReplyRoundedIcon />
        </button>
      </div>
    </div>
  );
}
