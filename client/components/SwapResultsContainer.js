import React, { Component, useCallback } from "react";
import PropTypes from "prop-types";
import SwapListing from "./SwapListing";
import styles from "./styles/SwapResultsContainer.module.scss";
import { newSwapRequest } from "../utils/changeFunctions";
import SearchBy from "./SearchBy";

/**
 * Container component for all swap results on /find-swap
 * @use SwapListing
 * @param cuisineChecked Array of cuisine names ticked off by user
 * @param rating Min rating from 1-5
 * @param distance Max distance from 5-100 (may change)
 */
export default class SwapResultsContainer extends Component {
  render() {
    const searchDispatch = this.props.searchDispatch;
    const setOrderBy = this.props.setOrderBy;
    const searchState = this.props.searchState;
    const lastUser = this.props.lastUser;
    const numLoadedUsers = this.props.numLoadedUsers;
    const innerRefData = this.props.innerRefData;

    const exUserJSX = searchState.map((user, index) => (
      <SwapListing
        innerRef={index + 1 == numLoadedUsers ? lastUser : null}
        innerRefData={index + 1 == numLoadedUsers ? innerRefData : null}
        pfpLink={user.pfpLink}
        username={user.username}
        distance={user.distance}
        rating={user.avg_rating}
        cuisineSpecialities={user.cuisineSpecialities}
        key={user.username}
        accountUid={user.accountUid}
        numRatings={user.numRatings}
        finalColJsx={
          <>
            <button
              style={{ border: "0px" }}
              onClick={(e) => {
                this.createNewSwapRequest(
                  this.props.user,
                  user.accountUid,
                  user.username,
                  searchDispatch
                );
              }}
            >
              <img
                className={styles.small_swap_button}
                src="/swap.svg"
                style={{ height: "80px" }}
              ></img>
            </button>
            <button
              className={styles.swap_button}
              onClick={(e) => {
                this.createNewSwapRequest(
                  this.props.user,
                  user.accountUid,
                  user.username,
                  searchDispatch
                );
              }}
            >
              <span className={styles.swap_text}>Send Swap Request</span>
            </button>
          </>
        }
      />
    ));

    return (
      <div className={styles.swap_results_container}>
        <div className={styles.swap_header}>
          <SearchBy containerStyle={{ display: "flex" }} />
          <div>
            <span>Sort By:</span>
            <select
              className={styles.swap_option}
              onChange={(e) => {
                setOrderBy(e.target.value);
              }}
            >
              <option value="distanceAsc">Distance - Low to High</option>
              <option value="distanceDesc">Distance - High to Low</option>
              <option value="avgRatingAsc">Rating - Low to High</option>
              <option value="avgRatingDesc">Rating - High to Low</option>
            </select>
          </div>
        </div>
        {exUserJSX}
      </div>
    );
  }

  createNewSwapRequest(user, requesteeUid, requesteeUsername, searchDispatch) {
    newSwapRequest(user.accountUid, requesteeUid, requesteeUsername).then(
      () => {
        searchDispatch({ type: "new-swap", payload: requesteeUid });
      }
    );
  }
}
