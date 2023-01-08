import React from "react";
import { TextField, Tooltip } from "@mui/material";

export default function FilterByUsername() {
  return (
    <>
      <div
        className="filter-form-header"
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
            className="filter-form-tooltip"
          />
        </Tooltip>
      </div>
      <TextField id="outlined-basic" label="Username" variant="outlined" />
    </>
  );
}
