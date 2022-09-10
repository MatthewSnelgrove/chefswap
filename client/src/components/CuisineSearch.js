import React, { Component } from 'react';
import "./CuisineSearch.scss";
import "../general.scss";

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
