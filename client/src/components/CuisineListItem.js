import React, { Component } from 'react';
import PropTypes from "prop-types";
import "./CuisineListItem.scss";

/**
 * Checkbox with cuisine name
 * @param tag Cuisine name
 */
export default class CuisineListItem extends Component {
  render() {
    const tag = this.props.tag;

    return (
      <div>
        <input type="checkbox" id={tag} name="cuisineName" value={tag} />
        <label htmlFor={tag} className="checkbox-label">{tag}</label>
      </div>
    )
  }
}

CuisineListItem.propTypes = {
  tag: PropTypes.string.isRequired,
};
