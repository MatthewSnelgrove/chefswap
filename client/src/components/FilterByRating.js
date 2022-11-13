import React, { Component } from 'react';
import PropTypes from "prop-types";
import "../general.scss";
import "./styles/FilterByRating.scss";

/**
 * Container component for filtering swap results by rating
 * @param rating Min review filter from 1-5
 * @param fcn... for handling form change
 */
export default class FilterByRating extends Component {
  constructor(props) {
    super(props);
    this.handleRatingChange = this.handleRatingChange.bind(this);
  }

  handleRatingChange(i) {
    this.props.onRatingChange(i);
    console.log(i);
  }

  render() {
    const rating = this.props.rating;

    // Array of star buttons in JSX
    let starButtons = [];

    for (let i = 0; i < 5; i++) {
      let starClassString = (i < rating) ? "material-symbols-rounded symbol-fill" : "material-symbols-rounded";

      starButtons.push(
        <button type="button" className="star-rating-buttons" key={i} onClick={() => this.handleRatingChange(i + 1)} >
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
