import React, { Component } from 'react';
import PropTypes from "prop-types";
import SwapListing from "./SwapListing";
import "./styles/SwapResultsContainer.scss";

/**
 * Container component for all swap results on /find-swap
 * @use SwapListing
 * @param cuisineChecked Array of cuisine names ticked off by user
 * @param rating Min rating from 1-5
 * @param distance Max distance from 5-100 (may change)
 */
export default class SwapResultsContainer extends Component {
  render() {
    const cuisineChecked = this.props.cuisineChecked;
    const minRating = this.props.rating;
    const maxDist = this.props.distance;

    // Returns if subarr is subarray of arr
    const isSubArray = (arr, subarr) => {
      let isSub = true;

      subarr.forEach(element => {
        if (!arr.includes(element)) isSub = false;
      });

      return isSub;
    };

    // Returns if user passes all filters
    const passesFilters = (user) => {
      let pass = true;

      // Check cuisine name
      if (!isSubArray(user.cuisineSpecialties, cuisineChecked)) pass = false;

      // Check min ratings
      else if (user.avg_rating < minRating) pass = false;

      // Check max distance
      else if (user.distance > maxDist) pass = false;

      return pass;
    };

    const exUsers = {
      user0: {
        username: "Matthew Snelgrove",
        distance: "2km",
        avg_rating: 1,
        cuisineSpecialties: ["Pizza", "Cereal"],
      },
      user1: {
        username: "Andre Fong",
        distance: "10.2km",
        avg_rating: 2,
        cuisineSpecialties: ["Korean", "Chinese"],
      },
      user2: {
        username: "Victor Hurst",
        distance: "99km",
        avg_rating: 3,
        cuisineSpecialties: ["Italian"],
      },
      user3: {
        username: "Mock user 1",
        distance: "42km",
        avg_rating: 2.4,
        cuisineSpecialties: ["Vietnamese", "Chinese"],
      },
      user4: {
        username: "Mock user 2",
        distance: "1.3km",
        avg_rating: 5,
        cuisineSpecialties: ["Cereal", "Italian", "Pizza"],
      },
      user5: {
        username: "Mock user 3",
        distance: "74km",
        avg_rating: 3.9,
        cuisineSpecialties: ["Indian", "Vietnamese", "Italian", "Chinese", "Korean"],
      },
    };

    // Array of user objs
    let exUserArr = Object.keys(exUsers).map(userKey => exUsers[userKey]);

    // Filter by all filters
    exUserArr = exUserArr.filter(user => passesFilters(user));

    // Map filtered array to JSX
    const exUserJSX = exUserArr.map(user => <SwapListing username={user.username} distance={user.distance}
      rating={user.avg_rating} cuisineSpecialties={user.cuisineSpecialties} key={user.username} />);

    return (
      <div className="swap-results-container">
        {exUserJSX}
      </div>
    )
  }
}

SwapResultsContainer.propTypes = {
  cuisineChecked: PropTypes.array.isRequired,
  rating: PropTypes.number.isRequired,
  distance: PropTypes.number.isRequired,
};
