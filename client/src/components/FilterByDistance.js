import React, { Component } from "react";
import PropTypes from "prop-types";
import "./styles/FilterByDistance.scss";
import "../general.scss";

/**
 * Container component for filtering swap results by distance
 * @param distance Max distance from 5-100 (may change)
 * @param fcns... for handling onchange
 */
export default class FilterByDistance extends Component {
  constructor(props) {
    super(props);
    this.handleDistanceChange = this.handleDistanceChange.bind(this);
  }

  handleDistanceChange(e) {
    let slider = document.querySelector(".slider-output");
    slider.innerHTML = e.target.value + " km";
    this.props.onDistanceChange(Number(e.target.value));
  }

  render() {
    const distance = this.props.distance;

    return (
      <fieldset className="filter-fieldset-section">
        <legend>Filter by Distance</legend>

        <div className="filter-distance-container filter-container">
          <label htmlFor="distance-slider" className="label-gray">
            Max Distance
          </label>
          <input
            type="range"
            name="maxDistance"
            className="distance-slider"
            min="5"
            max="100"
            value={distance}
            onChange={this.handleDistanceChange}
          />
          <output className="slider-output">100 km</output>
        </div>
      </fieldset>
    );
  }
}

FilterByDistance.propTypes = {
  distance: PropTypes.number.isRequired,
  onDistanceChange: PropTypes.func.isRequired,
};
