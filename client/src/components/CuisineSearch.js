import React, { Component } from 'react';
import PropTypes from "prop-types";
import "./styles/CuisineSearch.scss";
import "../general.scss";

/**
 * Text input for filtering cuisine list checkboxes
 * @param cuisineTyped Cuisine name typed into search bar
 * @param fcns... For handling onchange
 */
export default class CuisineSearch extends Component {
  constructor(props) {
    super(props);
    this.handleTypedChange = this.handleTypedChange.bind(this);
  }

  handleTypedChange(e) {
    this.props.onTypedChange(e.target.value);
  }

  render() {
    return (
      <div className="cuisine-search-container">

        <label htmlFor="cuisine-search" className="label-gray">Search</label>
        <input type="text" id="cuisine-search" name="cuisine-search" placeholder="Cuisine name"
          value={this.props.cuisineTyped} onChange={this.handleTypedChange} />
      </div>
    )
  }
}

CuisineSearch.propTypes = {
  cuisineTyped: PropTypes.string.isRequired,
  onTypedChange: PropTypes.func.isRequired,
}
