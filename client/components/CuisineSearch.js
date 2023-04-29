import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "./styles/CuisineSearch.module.scss";

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
      <div className={styles.cuisine_search_container}>
        <label htmlFor="cuisine-search" className={styles.label_gray}>
          Search
        </label>
        <input
          type="text"
          id="cuisine-search"
          className={styles.cuisine_search}
          name="cuisine-search"
          placeholder="Cuisine name"
          value={this.props.cuisineTyped}
          onChange={this.handleTypedChange}
        />
      </div>
    );
  }
}

CuisineSearch.propTypes = {
  cuisineTyped: PropTypes.string.isRequired,
  onTypedChange: PropTypes.func.isRequired,
};
