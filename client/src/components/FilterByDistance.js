import React from "react";
import "./styles/FilterByDistance.scss";
import "../general.scss";
import { Slider } from "@mui/material";

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
    <div>
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
      />
    </div>
  );
}

// FilterByDistance.propTypes = {
//   distance: PropTypes.number.isRequired,
//   onDistanceChange: PropTypes.func.isRequired,
// };
