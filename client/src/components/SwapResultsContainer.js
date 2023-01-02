import React, { Component, useCallback } from "react";
import PropTypes from "prop-types";
import SwapListing from "./SwapListing";
import "./styles/SwapResultsContainer.scss";
import { newSwapRequest } from "../utils/changeFunctions";

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
    const lastUser = this.props.lastUser
    const numLoadedUsers = this.props.numLoadedUsers
    const innerRefData = this.props.innerRefData

    const exUserJSX = searchState.map((user, index) => (
      <SwapListing
        innerRef={index + 1 == numLoadedUsers ? lastUser: null}
        innerRefData={index + 1 == numLoadedUsers ? innerRefData: null}
        pfpLink={user.pfpLink}
        username={user.username}
        distance={user.distance}
        rating={user.avg_rating}
        cuisineSpecialities={user.cuisineSpecialities}
        key={user.username}
        accountUid={user.accountUid}
        finalColJsx={
          <>
            <button style={{border: "0px"}} onClick={(e) => {
              this.createNewSwapRequest(this.props.user, user.accountUid, user.username, searchDispatch)
            }}>
              <img className="small-swap-button" src="./swap.svg" style={{height: "80px"}}></img>
            </button>
            <button className="swap-button" onClick={(e) => {
              this.createNewSwapRequest(this.props.user, user.accountUid, user.username, searchDispatch)
            }}>
              <span className="swap-text">Send Swap Request</span>
            </button>
          </>
        }
      />
    ));

    return (
      <div className="swap-results-container">
        <div className="swap-header">
          Sort By:
          <select className="swap-option" onChange={(e) => {
            setOrderBy(e.target.value)
          }}>
            <option value="distanceAsc">Distance - Low to High</option>
            <option value="distanceDesc">Distance - High to Low</option>
            <option value="avgRatingAsc">Rating - Low to High</option>
            <option value="avgRatingDesc">Rating - High to Low</option>
          </select>
        </div>
        {exUserJSX}
      </div>
    );
  }

  createNewSwapRequest(user, requesteeUid, requesteeUsername, searchDispatch) {
    newSwapRequest(user.accountUid, requesteeUid, requesteeUsername)
    searchDispatch({ type: "new-swap", payload: requesteeUid })
  }
}
