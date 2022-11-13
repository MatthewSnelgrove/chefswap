import React, { Component } from 'react';
import "./styles/CuisineSearch.scss";
import "../general.scss";

/**
 * Text input for filtering cuisine list checkboxes
 */
export default class CuisineSearch extends Component {
  render() {
    return (
      <div className="cuisine-search-container">

        <label htmlFor="cuisine-search" className="label-gray">Search</label>
        <input type="text" id="cuisine-search" name="cuisine-search" placeholder="Type a cuisine..." />
      </div>
    )
  }
}
