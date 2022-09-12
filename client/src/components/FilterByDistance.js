import React, { Component } from 'react';
import "./FilterByDistance.scss";
import "../general.scss";

/**
 * Container component for filtering swap results by distance
 */
export default class FilterByDistance extends Component {
  render() {
    return (
      <fieldset className="filter-fieldset-section">
        <legend>Filter by Distance</legend>

        <div className="filter-distance-container filter-container">
          <label htmlFor="distance-slider" className="label-gray">Max Distance</label>
          <input type="range" name="maxDistance" className="distance-slider" min="5" max="100" />
        </div>
      </fieldset>
    )
  }
}

