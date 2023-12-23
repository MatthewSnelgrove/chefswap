import React from "react";
import styles2 from "./styles/FilterForm.module.scss";
import { Slider } from "@mui/material";
import { Tooltip } from "@mui/material";

/**
 * Container component for filtering swap results by distance
 * @param distance Max distance from 5-100 (may change)
 * @param fcns... for handling onchange
 */
export default function FilterByDistance(props) {
  if (props.distance === undefined || !props.onDistanceChange) {
    console.error("Missing function props in FilterByDistance");
    return null;
  }

  return (
    <>
      <div
        className={styles2.filter_form_header}
        style={{ display: "flex", alignItems: "center", gap: 15 }}
      >
        <h2>Where?</h2>
        <Tooltip
          title="Filter by where your swap partner is located."
          arrow
          placement="right"
        >
          <img
            src="/info.svg"
            alt="Tooltip for cuisine filter"
            className={styles2.filter_form_tooltip}
          />
        </Tooltip>
      </div>
      <Slider
        defaultValue={100}
        aria-label="Distance slider"
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => {
          return value !== 100 ? `${value} km` : "Unlimited";
        }}
        onChange={(event, value) => {
          props.onDistanceChange(value === 100 ? null : value);
        }}
        min={5}
        value={props.distance || 100}
        color="primary"
      />
      <p style={{ textAlign: "center" }}>
        {props.distance
          ? `Under ${props.distance} km away`
          : "No distance limit"}
      </p>
    </>
  );
}

// FilterByDistance.propTypes = {
//   distance: PropTypes.number.isRequired,
//   onDistanceChange: PropTypes.func.isRequired,
// };
