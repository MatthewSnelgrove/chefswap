import React, { Component } from 'react';
import FilterByCuisineSection from './FilterByCuisineSection';
import FilterByRating from "./FilterByRating";
import FilterByDistance from "./FilterByDistance";
import "./FilterForm.scss";

export default class FilterForm extends Component {
  render() {
    return (
      <div className="filter-form-container">
        <form action="">
          <FilterByCuisineSection />
          <FilterByRating />
          <FilterByDistance />
        </form>
      </div>
    )
  }
}
