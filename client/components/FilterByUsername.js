import React from "react";
import { TextField, Tooltip } from "@mui/material";
import styles from "./styles/FilterForm.module.scss";

export default function FilterByUsername(props) {
  if (props.username === undefined || !props.onUsernameChange) {
    console.error("Missing function props in FilterByUsername");
    return null;
  }

  return (
    <>
      <div
        className={styles.filter_form_header}
        style={{ display: "flex", alignItems: "center", gap: 15 }}
      >
        <h2>Who?</h2>
        <Tooltip
          title="Filter by who your swap partner is."
          arrow
          placement="right"
        >
          <img
            src="/info.svg"
            alt="Tooltip for cuisine filter"
            className={styles.filter_form_tooltip}
          />
        </Tooltip>
      </div>
      <TextField
        id="outlined-basic"
        label="Username"
        variant="outlined"
        value={props.username || ""}
        onChange={(event) => {
          props.onUsernameChange(
            !event.target.value ? null : event.target.value
          );
        }}
      />
    </>
  );
}
