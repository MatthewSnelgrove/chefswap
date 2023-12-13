import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "./styles/CuisineListItem.module.scss";

/**
 * Checkbox with cuisine name
 * @param tag Cuisine name
 * @param checked Boolean representing checked or unchecked cuisine item
 * @param fcns... to handle onchange
 */
export default class CuisineListItem extends Component {
  constructor(props) {
    super(props);
    this.handleTickedChange = this.handleTickedChange.bind(this);
  }

  handleTickedChange(e) {
    this.props.onTickedChange(e.target.value, e.target.checked);
  }

  render() {
    const tag = this.props.tag;
    const checked = this.props.checked;

    return (
      <div>
        <input
          type="checkbox"
          id={tag}
          name="cuisineName"
          value={tag}
          checked={checked}
          onChange={this.handleTickedChange}
        />
        <label htmlFor={tag} className={styles.checkbox_label}>
          {tag}
        </label>
      </div>
    );
  }
}

CuisineListItem.propTypes = {
  tag: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onTickedChange: PropTypes.func.isRequired,
};

CuisineListItem.defaultProps = {
  checked: false,
};
