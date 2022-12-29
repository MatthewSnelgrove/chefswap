import React, { Component } from "react";
import PropTypes from "prop-types";
import SwapListing from "./SwapListing";
import "./styles/SwapResultsContainer.scss";
import { newSwapRequest, sendSwapRequest } from "../utils/changeFunctions";
import { newSwapRequest, sendSwapRequest } from "../utils/changeFunctions";

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
    const setUsers = this.props.setUsers;
    let users = this.props.users;
    
    // Returns if subarr is subarray of arr
    // const isSubArray = (arr, subarr) => {
    //   let isSub = true;

    //   subarr.forEach((element) => {
    //     if (!arr.includes(element)) isSub = false;
    //   });

    //   return isSub;
    // };

    // // Returns if user passes all filters
    // const passesFilters = (user) => {
    //   let pass = true;

    //   // Check cuisine name
    //   if (!isSubArray(user.cuisineSpecialities, cuisineChecked)) pass = false;
    //   // Check min ratings
    //   else if (user.avg_rating < minRating) pass = false;

    //   // Check max distance
    //   if (user.distance > maxDist) pass = false;

    //   return pass;
    // };

    // const exUsers = {
    //   user0: {
    //     username: "Matthew Snelgrove",
    //     distance: 2,
    //     avg_rating: 1,
    //     cuisineSpecialties: ["Pizza", "Cereal"],
    //   },
    //   user1: {
    //     username: "Andre Fong",
    //     distance: 10.2,
    //     avg_rating: 2,
    //     cuisineSpecialties: ["Korean", "Chinese"],
    //   },
    //   user2: {
    //     username: "Victor Hurst",
    //     distance: 99,
    //     avg_rating: 3,
    //     cuisineSpecialties: ["Italian"],
    //   },
    //   user3: {
    //     username: "Mock user 1",
    //     distance: 42,
    //     avg_rating: 2.4,
    //     cuisineSpecialties: ["Vietnamese", "Chinese"],
    //   },
    //   user4: {
    //     username: "Mock user 2",
    //     distance: 1.3,
    //     avg_rating: 5,
    //     cuisineSpecialties: ["Cereal", "Italian", "Pizza"],
    //   },
    //   user5: {
    //     username: "Mock user 3",
    //     distance: 74,
    //     avg_rating: 3.9,
    //     cuisineSpecialties: [
    //       "Indian",
    //       "Vietnamese",
    //       "Italian",
    //       "Chinese",
    //       "Korean",
    //     ],
    //   },
    // };

    // // Array of user objs
    // // let exUserArr = Object.keys(exUsers).map((userKey) => exUsers[userKey]);


    // // Filter by all filters
    // // exUserArr = exUserArr.filter((user) => passesFilters(user));
    // users = users.filter((user) => passesFilters(user))

    // Map filtered array to JSX
    const exUserJSX = users.map((user) => (
    const exUserJSX = users.map((user) => (
      <SwapListing
        pfpLink={user.pfpLink}
        pfpLink={user.pfpLink}
        username={user.username}
        distance={user.distance}
        rating={user.avg_rating}
        cuisineSpecialities={user.cuisineSpecialities}
        cuisineSpecialities={user.cuisineSpecialities}
        key={user.username}
        finalColJsx={
          <>
            <button style={{border: "0px"}} onClick={(e) => {
              this.createNewSwapRequest(this.props.user, user.accountUid, user.username, setUsers)
            }}>
              <img className="small-swap-button" src="./swap.svg" style={{height: "80px"}}></img>
            </button>
            <button className="swap-button" onClick={(e) => {
              this.createNewSwapRequest(this.props.user, user.accountUid, user.username, setUsers)
            }}>
              <span className="swap-text">Send Swap Request</span>
            </button>
          </>
        }
      />
    ));

    return <div className="swap-results-container">{exUserJSX}</div>;
  }

  createNewSwapRequest(user, requesteeUid, requesteeUsername, setUsers) {
    newSwapRequest(user.accountUid, requesteeUid, requesteeUsername)
    setUsers((curUsers) => curUsers.filter((filterUser) => filterUser.profile.accountUid != requesteeUid))
  }
}

SwapResultsContainer.propTypes = {
  cuisineChecked: PropTypes.array.isRequired,
  rating: PropTypes.number.isRequired,
  distance: PropTypes.number.isRequired,
};
