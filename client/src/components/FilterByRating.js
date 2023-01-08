import React from "react";
import "../general.scss";
import "./styles/FilterByRating.scss";
import Rating from "@mui/material/Rating";
import { Tooltip } from "@mui/material";

/**
 * Container component for filtering swap results by rating
 * @param rating Min review filter from 1-5
 * @param fcn... for handling form change
 */
export default function FilterByRating(props) {
  if (
    props.rating === undefined ||
    props.rating === null ||
    !props.onRatingChange
  ) {
    console.error("Missing function props in FilterByRating");
    return null;
  }

  return (
    <>
      <div
        className="filter-form-header"
        style={{ display: "flex", alignItems: "center", gap: 15 }}
      >
        <h2>How?</h2>
        <Tooltip
          title="Filter by how experienced your swap partner is."
          arrow
          placement="right"
        >
          <img
            src="/info.svg"
            alt="Tooltip for rating filter"
            className="filter-form-tooltip"
          />
        </Tooltip>
      </div>
      <div style={{ lineHeight: 1, display: "flex", alignItems: "center" }}>
        {/* fix for rating spacing */}
        <Rating
          name="rating"
          value={props.rating}
          precision={0.5}
          onChange={(event, newValue) => {
            if (newValue === null) newValue = 0; // fix for empty rating
            props.onRatingChange(newValue);
          }}
          size="large"
        />
        <span style={{ marginLeft: 10 }}>and up</span>
      </div>
    </>
  );
}

// FilterByRating.propTypes = {
//   rating: PropTypes.number.isRequired,
// };
