import React, { useState } from "react";
import FilterForm from "../components/FilterForm";

// test for FilterForm
function AboutUsPage() {
  // Note: Cuisine text state removed
  const [cuisineChecked, setCuisineChecked] = useState([]);
  const [rating, setRating] = useState(1);
  const [distance, setDistance] = useState(100);

  function handleTickedChange(value) {
    console.log(`Cuisine ticked off: ${value}`);
    setCuisineChecked(value);
  }

  function handleRatingChange(value) {
    console.log(`Rating changed to ${value}`);
    setRating(value);
  }

  function handleDistanceChange(value) {
    console.log(`Distance changed to ${value}`);
    setDistance(value);
  }

  return (
    <>
      <FilterForm
        // cuisineTyped={cuisineTyped}
        cuisineChecked={cuisineChecked}
        rating={rating}
        distance={distance}
        // onTypedChange={handleTypedChange}
        onTickedChange={handleTickedChange}
        onRatingChange={handleRatingChange}
        onDistanceChange={handleDistanceChange}
      />
    </>
  );
}

export default AboutUsPage;
