import React, { Component } from 'react';
import FilterByCuisineSection from './FilterByCuisineSection';
import FilterByRating from "./FilterByRating";
import FilterByDistance from "./FilterByDistance";
import PropTypes from "prop-types";
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
export default class FilterForm extends Component {
  render() {
    return (
      <div className="filter-form-container">
        <form action="">
          <FilterByCuisineSection cuisineTyped={this.props.cuisineTyped}
            cuisineChecked={this.props.cuisineChecked} onTypedChange={this.props.onTypedChange}
            onTickedChange={this.props.onTickedChange} />
          <FilterByRating rating={this.props.rating} onRatingChange={this.props.onRatingChange} />
          <FilterByDistance distance={this.props.distance} onDistanceChange={this.props.onDistanceChange} />
        </form>
      </div>
    )
  }
}

FilterForm.propTypes = {
  cuisineTyped: PropTypes.string.isRequired,
  cuisineChecked: PropTypes.array.isRequired,
  rating: PropTypes.number.isRequired,
  distance: PropTypes.number.isRequired,
  onTypedChange: PropTypes.func.isRequired,
  onTickedChange: PropTypes.func.isRequired,
  onRatingChange: PropTypes.func.isRequired,
  onDistanceChange: PropTypes.func.isRequired,
};
