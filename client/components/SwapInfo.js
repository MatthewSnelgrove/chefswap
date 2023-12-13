import React from "react";
import styles from "./styles/SwapInfo.module.scss";

/*
format of prop data
data {
    date: date string
    address: address string
    img: source to picture
}
*/
function SwapInfo(props) {
  return (
    <div>
      <div className={styles.main_container_i}>
        <div className={styles.user_info_i}>
          <img
            alt="User profile"
            src={props.img}
            style={{ height: 55, width: 55, borderRadius: 30 }}
          />
          <span className={styles.flow_tag_i}>{props.username}</span>
        </div>

        <div className={styles.date_tag_i}>{props.date}</div>
        <div className={styles.distance_tag_i}>{props.distance} from you</div>

        <button className={styles.bg_info_i}>
          <img
            src="/chat_bubble.svg"
            style={{ width: "50px", height: "50px" }}
          ></img>
        </button>
      </div>
    </div>
  );
}

export default SwapInfo;
