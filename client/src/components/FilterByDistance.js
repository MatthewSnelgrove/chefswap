import React, { Component } from 'react';
import PropTypes from "prop-types";
import "./styles/FilterByDistance.scss";
import "../general.scss";

/**
 * Container component for filtering swap results by distance
 * @param distance Max distance from 5-100 (may change)
 */
export default class FilterByDistance extends Component {
  render() {
    const distance = this.props.distance;

    return (
      <fieldset className="filter-fieldset-section">
        <legend>Filter by Distance</legend>

        <div className="filter-distance-container filter-container">
          <label htmlFor="distance-slider" className="label-gray">Max Distance</label>
          <input type="range" name="maxDistance" className="distance-slider" min="5" max="100" value={distance} />
        </div>
      </fieldset>
    )
  }
}

FilterByDistance.propTypes = {
  distance: PropTypes.number.isRequired,
};
