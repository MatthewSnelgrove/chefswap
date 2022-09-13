import React, { Component } from 'react';
import PropTypes from "prop-types";
import "../general.scss";
import "./styles/FilterByRating.scss";

/**
 * Container component for filtering swap results by rating
 * @param rating Min review filter from 1-5
 */
export default class FilterByRating extends Component {
  render() {
    const rating = this.props.rating;

    // Array of star buttons in JSX
    let starButtons = [];

    for (let i = 0; i < 5; i++) {
      let starClassString = (i < rating) ? "material-symbols-rounded symbol-fill" : "material-symbols-rounded";

      starButtons.push(
        <button type="button" className="star-rating-buttons" key={`star${i}`} >
          <span className={starClassString}>star</span>
        </button>
      );
    }

    return (
      <fieldset className="filter-fieldset-section">
        <legend>Filter by Rating</legend>

        <div className="filter-rating-container filter-container">
          {starButtons}
        </div>
      </fieldset>
    )
  }
}

FilterByRating.propTypes = {
  rating: PropTypes.number.isRequired,
};
