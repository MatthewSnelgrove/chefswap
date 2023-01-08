import React from "react";
import FilterByCuisineSection from "./FilterByCuisineSection";
import FilterByRating from "./FilterByRating";
import FilterByDistance from "./FilterByDistance";
import FilterByUsername from "./FilterByUsername";
import "./styles/FilterForm.scss";

/**
 * Container component for FILTERING swap results (sidebar of /find-swap)
 * @use FilterByCuisineSection, FilterByRating, FilterByDistance
 * @param cuisineTyped Cuisine name typed into search bar
 * @param cuisineChecked Array of cuisine names ticked off by user
 * @param rating Min rating from 1-5
 * @param distance Max distance from 5-100 (may change)
 * @param fcns... for handling form change
 */
export default function FilterForm(props) {
  if (
    !props.cuisineChecked ||
    !props.onTickedChange ||
    // !props.rating ||
    !props.distance ||
    !props.onRatingChange ||
    !props.onDistanceChange
  ) {
    console.error("Missing function props in FilterForm");
    return null;
  }

  return (
    <div className="filter-form-container" style={{ paddingTop: "20px" }}>
      <form action="">
        <FilterByCuisineSection
          // cuisineTyped={this.props.cuisineTyped}
          cuisineChecked={props.cuisineChecked}
          // onTypedChange={this.props.onTypedChange}
          onTickedChange={props.onTickedChange}
        />
        <FilterByRating
          rating={props.rating}
          onRatingChange={props.onRatingChange}
        />
        <FilterByDistance
          distance={props.distance}
          onDistanceChange={props.onDistanceChange}
        />
        <FilterByUsername
          username={props.username}
          onUsernameChange={props.onUsernameChange}
        />
      </form>
    </div>
  );
}

// FilterForm.propTypes = {
//   // cuisineTyped: PropTypes.string.isRequired,
//   cuisineChecked: PropTypes.array.isRequired,
//   rating: PropTypes.number.isRequired,
//   distance: PropTypes.number.isRequired,
//   // onTypedChange: PropTypes.func.isRequired,
//   onTickedChange: PropTypes.func.isRequired,
//   onRatingChange: PropTypes.func.isRequired,
//   onDistanceChange: PropTypes.func.isRequired,
// };
