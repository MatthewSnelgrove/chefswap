import React, { Component } from 'react';
import CuisineSearch from './CuisineSearch';
import CuisineSearchList from './CuisineSearchList';
import "../general.scss";

export default class FilterByCuisineSection extends Component {
  render() {
    return (
      <fieldset>
        <legend>Filter by Cuisine</legend>
        <div className="filter-by-cuisine-section filter-container">
          <CuisineSearch />
          <CuisineSearchList />
        </div>
      </fieldset>
    )
  }
}
