import React, { Component } from "react";
import PropTypes from "prop-types";
import CuisineListItem from "./CuisineListItem";
import styles from "./styles/CuisineSearchList.module.scss";

/**
 * List of cuisine checkboxes to filter list by
 * @use CuisineListItem
 * @param cuisineTyped Cuisine name typed into search bar
 * @param cuisineChecked Array of cuisine names ticked off by user
 * @param fcns... to handle onchange
 */
export default class CuisineSearchList extends Component {
  render() {
    // TODO: get all cuisine names from db
    const cuisines = [
      "Indian",
      "Pizza",
      "Korean",
      "Chinese",
      "Italian",
      "Vietnamese",
      "Cereal",
      "BBQ",
    ];
    const cuisineChecked = this.props.cuisineChecked;
    const cuisineTyped = this.props.cuisineTyped;

    let cuisineList = cuisines.filter((cuisine) =>
      cuisine.toLowerCase().includes(cuisineTyped.toLowerCase())
    );
    cuisineList = cuisineList.map((cuisine) => (
      <CuisineListItem
        tag={cuisine}
        checked={cuisineChecked.includes(cuisine)}
        key={cuisine}
        onTickedChange={this.props.onTickedChange}
      />
    ));

    return (
      <fieldset className={styles.cuisine_list_container}>
        {cuisineList}
      </fieldset>
    );
  }
}

CuisineSearchList.propTypes = {
  cuisineChecked: PropTypes.array.isRequired,
  cuisineTyped: PropTypes.string.isRequired,
  onTickedChange: PropTypes.func.isRequired,
};
