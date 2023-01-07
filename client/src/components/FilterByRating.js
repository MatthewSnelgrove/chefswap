import React from "react";
import "../general.scss";
import "./styles/FilterByRating.scss";
import Rating from "@mui/material/Rating";

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
    <div style={{ lineHeight: 1 }}>
      {/* fix for rating spacing */}
      <Rating
        name="rating"
        value={props.rating}
        precision={0.5}
        onChange={(event, newValue) => {
          if (newValue === null) newValue = 0; // fix for empty rating
          props.onRatingChange(newValue);
        }}
      />
    </div>
  );
}

// FilterByRating.propTypes = {
//   rating: PropTypes.number.isRequired,
// };
