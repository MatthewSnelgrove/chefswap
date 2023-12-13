import React from "react";
import styles from "./styles/SwapListBlueprint.module.css";
import global_vars from "../utils/config";

function SwapListBlueprint(props) {
  const loading = global_vars.userStates.loading;

  if (props.data == loading) {
    return <></>;
  }

  return (
    <div>
      <div className={styles.swap_type_container}>
        <div>
          <h2>{props.type}</h2>
        </div>
      </div>
      <div className={styles.list_container}>
        {props.children}
        <span className={styles.no_type_text}>
          {props.data.length == 0
            ? `No users of type ${props.type.toLowerCase()}`
            : ""}
        </span>
      </div>
    </div>
  );
}

export default SwapListBlueprint;
