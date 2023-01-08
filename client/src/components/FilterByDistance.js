import React from "react";
import "./styles/FilterByDistance.scss";
import "../general.scss";
import { Slider } from "@mui/material";
import { Tooltip } from "@mui/material";

/**
 * Container component for filtering swap results by distance
 * @param distance Max distance from 5-100 (may change)
 * @param fcns... for handling onchange
 */
export default function FilterByDistance(props) {
  if (!props.distance || !props.onDistanceChange) {
    console.error("Missing function props in FilterByDistance");
    return null;
  }

  return (
    <>
      <div
        className="filter-form-header"
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
            className="filter-form-tooltip"
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
          props.onDistanceChange(value);
        }}
        min={5}
        value={props.distance}
        color="primary"
      />
      <p style={{ textAlign: "center" }}>
        {props.distance !== 100
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
