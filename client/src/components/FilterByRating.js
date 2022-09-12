import React, { Component } from 'react';
import "../general.scss";
import "./FilterByRating.scss";

/**
 * Container component for filtering swap results by rating
 */
export default class FilterByRating extends Component {
  render() {
    return (
      <fieldset className="filter-fieldset-section">
        <legend>Filter by Rating</legend>

        <div className="filter-rating-container filter-container">
          <button type="button" id="star1" className="star-rating-buttons">
            <span className="material-symbols-rounded symbol-fill">star</span>
          </button>
          <button type="button" id="star2" className="star-rating-buttons">
            <span className="material-symbols-rounded symbol-fill">star</span>
          </button>
          <button type="button" id="star3" className="star-rating-buttons">
            <span className="material-symbols-rounded symbol-fill">star</span>
          </button>
          <button type="button" id="star4" className="star-rating-buttons">
            <span className="material-symbols-rounded symbol-fill">star</span>
          </button>
          <button type="button" id="star5" className="star-rating-buttons">
            <span className="material-symbols-rounded">star</span>
          </button>
        </div>
      </fieldset>
    )
  }
}
