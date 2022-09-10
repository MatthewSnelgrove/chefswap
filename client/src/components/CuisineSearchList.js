import React, { Component } from 'react';
import CuisineListItem from "./CuisineListItem";
import "./CuisineSearchList.scss";

export default class CuisineSearchList extends Component {
  render() {
    return (
      <fieldset className="cuisine-list-container">
        <CuisineListItem tag="Indian" />
        <CuisineListItem tag="Italian" />
        <CuisineListItem tag="Chinese" />
        <CuisineListItem tag="Pizza" />
        <CuisineListItem tag="Pizza" />
        <CuisineListItem tag="Pizza" />
        <CuisineListItem tag="Pizza" />
        <CuisineListItem tag="Pizza" />
        <CuisineListItem tag="Pizza" />
        <CuisineListItem tag="Pizza" />
        <CuisineListItem tag="Pizza" />
        <CuisineListItem tag="Pizza" />
        <CuisineListItem tag="Pizza" />
      </fieldset>
    )
  }
}
