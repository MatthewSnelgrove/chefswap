import React, { useState } from "react";
import FilterForm from "../components/FilterForm";
import Navbar from "../components/Navbar";
import OnlyLoggedIn from "../components/OnlyLoggedIn";
import SwapResultsContainer from "../components/SwapResultsContainer";
import "./styles/FindSwapPage.scss";
/**
 * /find-swaps page
 * @use Navbar, FilterForm, SwapsResultsContainer
 */
export default function FindSwapPage() {
  const [cuisineTyped, setCuisineTyped] = useState("");
  const [cuisineChecked, setCuisineChecked] = useState([]);
  const [rating, setRating] = useState(1);
  const [distance, setDistance] = useState(100);

  function handleTypedChange(cuisineText) {
    setCuisineTyped(cuisineText);
  }

  function handleTickedChange(cuisineName, cuisineCheckedBool) {
    let newCuisineCheckedList;

    // If cuisine was just checked
    if (cuisineCheckedBool) {
      newCuisineCheckedList = cuisineChecked.slice();
      newCuisineCheckedList.push(cuisineName);
    }

    // If cuisine was just unchecked
    else {
      newCuisineCheckedList = cuisineChecked.filter(
        (cuisine) => cuisine !== cuisineName
      );
    }

    setCuisineChecked(newCuisineCheckedList);
  }

  function handleRatingChange(minRating) {
    setRating(minRating);
  }

  function handleDistanceChange(maxDist) {
    setDistance(maxDist);
  }

  return (
    <OnlyLoggedIn >
      <div className="find-swap-page">
        <div className="find-swap-content">
          <FilterForm
            cuisineTyped={cuisineTyped}
            cuisineChecked={cuisineChecked}
            rating={rating}
            distance={distance}
            onTypedChange={handleTypedChange}
            onTickedChange={handleTickedChange}
            onRatingChange={handleRatingChange}
            onDistanceChange={handleDistanceChange}
          />
          <SwapResultsContainer
            cuisineChecked={cuisineChecked}
            rating={rating}
            distance={distance}
          />
        </div>
      </div>
    </OnlyLoggedIn>
  );
}
