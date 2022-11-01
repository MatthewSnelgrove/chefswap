import React, { Component } from 'react';
import CuisineSearch from './CuisineSearch';
import CuisineSearchList from './CuisineSearchList';
import PropTypes from "prop-types";
import "../general.scss";

/**
 * Container component for filtering swap results by cuisine name
 * @use CuisineSearch, CuisineSearchList
 * @param cuisineTyped Cuisine name typed into search bar
 * @param cuisineChecked Array of cuisine names ticked off by user
 * @param fcns... For handling onchange
 */
export default class FilterByCuisineSection extends Component {
  render() {
    return (
      <fieldset className="filter-fieldset-section">
        <legend>Filter by Cuisine</legend>
        <div className="filter-by-cuisine-section filter-container">
          <CuisineSearch cuisineTyped={this.props.cuisineTyped} onTypedChange={this.props.onTypedChange} />
          <CuisineSearchList cuisineTyped={this.props.cuisineTyped} cuisineChecked={this.props.cuisineChecked}
            onTickedChange={this.props.onTickedChange} />
        </div>
      </fieldset>
    )
  }
}

FilterByCuisineSection.propTypes = {
  cuisineTyped: PropTypes.string.isRequired,
  cuisineChecked: PropTypes.array.isRequired,
  onTypedChange: PropTypes.func.isRequired,
  onTickedChange: PropTypes.func.isRequired,
}
