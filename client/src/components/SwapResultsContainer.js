import React, { Component } from 'react';
import SwapListing from "./SwapListing";
import "./styles/SwapResultsContainer.scss";

/**
 * Container component for all swap results on /find-swap
 * @use SwapListing
 */
export default class SwapResultsContainer extends Component {
  render() {
    const exUser = {
      username: "Matthew Snelgrove",
      distance: "88888 km",
      rating: "5",
      cuisineSpecialties: {
        Pizza: true,
        Italian: true,
      },
    };

    return (
      <div className="swap-results-container">
        <SwapListing username={exUser.username} distance={exUser.distance}
          rating={exUser.rating} cuisineSpecialties={exUser.cuisineSpecialties} />
        <SwapListing username={exUser.username} distance={exUser.distance}
          rating={exUser.rating} cuisineSpecialties={exUser.cuisineSpecialties} />
        <SwapListing username={exUser.username} distance={exUser.distance}
          rating={exUser.rating} cuisineSpecialties={exUser.cuisineSpecialties} />
        <SwapListing username={exUser.username} distance={exUser.distance}
          rating={exUser.rating} cuisineSpecialties={exUser.cuisineSpecialties} />
        <SwapListing username={exUser.username} distance={exUser.distance}
          rating={exUser.rating} cuisineSpecialties={exUser.cuisineSpecialties} />
        <SwapListing username={exUser.username} distance={exUser.distance}
          rating={exUser.rating} cuisineSpecialties={exUser.cuisineSpecialties} />
        <SwapListing username={exUser.username} distance={exUser.distance}
          rating={exUser.rating} cuisineSpecialties={exUser.cuisineSpecialties} />
        <SwapListing username={exUser.username} distance={exUser.distance}
          rating={exUser.rating} cuisineSpecialties={exUser.cuisineSpecialties} />
        <SwapListing username={exUser.username} distance={exUser.distance}
          rating={exUser.rating} cuisineSpecialties={exUser.cuisineSpecialties} />
        <SwapListing username={exUser.username} distance={exUser.distance}
          rating={exUser.rating} cuisineSpecialties={exUser.cuisineSpecialties} />
        <SwapListing username={exUser.username} distance={exUser.distance}
          rating={exUser.rating} cuisineSpecialties={exUser.cuisineSpecialties} />
      </div>
    )
  }
}
