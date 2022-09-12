import React, { Component } from 'react';
import CuisineSearch from './CuisineSearch';
import CuisineSearchList from './CuisineSearchList';
import "../general.scss";

/**
 * Container component for filtering swap results by cuisine name
 * @use CuisineSearch, CuisineSearchList
 */
export default class FilterByCuisineSection extends Component {
  render() {
    return (
      <fieldset className="filter-fieldset-section">
        <legend>Filter by Cuisine</legend>
        <div className="filter-by-cuisine-section filter-container">
          <CuisineSearch />
          <CuisineSearchList />
        </div>
      </fieldset>
    )
  }
}
