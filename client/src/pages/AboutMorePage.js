import React, { useState } from "react";
import FilterForm from "../components/FilterForm";

// test for FilterForm
function AboutUsPage() {
  // Note: Cuisine text state removed
  const [cuisineChecked, setCuisineChecked] = useState([]);
  const [rating, setRating] = useState(null);
  const [distance, setDistance] = useState(null);
  const [username, setUsername] = useState(null);

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

  function handleUsernameChange(value) {
    console.log(`Username changed to ${value}`);
    setUsername(value);
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
        username={username}
        onUsernameChange={handleUsernameChange}
      />
    </>
  );
}

export default AboutUsPage;
