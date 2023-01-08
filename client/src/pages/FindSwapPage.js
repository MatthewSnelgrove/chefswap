import React, { useEffect, useState, useRef, useCallback } from "react";
import FilterForm from "../components/FilterForm";
import OnlyLoggedIn from "../components/OnlyLoggedIn";
import SwapResultsContainer from "../components/SwapResultsContainer";
import "./styles/FindSwapPage.scss";
import { useUser } from "../components/useUser";
import { fetchSpecific } from "../utils/fetchFunctions";
import { useSwapSearch } from "../components/useSwapSearch";

// distance: (user.profile.distance / 1000).toFixed(1),
// avg_rating: user.profile.avgRating
function filterForDisplay(users) {
  return users.map((user) => {
    return {
      avg_rating: user.profile.avgRating,
      cuisineSpecialities: user.profile.cuisineSpecialities,
      distance: user.profile.distance / 1000,
      pfpLink: user.profile.pfpLink,
      username: user.profile.username,
      accountUid: user.profile.accountUid,
      numRatings: user.profile.numRatings
    }
  })
}

/**
 * /find-swaps page
 * @use Navbar, FilterForm, SwapsResultsContainer
 */
export default function FindSwapPage(props) {
  const user = useUser();
  const loading = global.config.userStates.loading;

  // State for filter form
  const [cuisineChecked, setCuisineChecked] = useState([]);
  const [rating, setRating] = useState(1);
  const [distance, setDistance] = useState(100);
  const [username, setUsername] = useState("");

  const [userAddress, setUserAddress] = useState(null);
  const [orderBy, setOrderBy] = useState("distanceAsc");
  const [userObserver, setUserObserver] = useState(null);
  const [searchState, searchDispatch, isLoading] = useSwapSearch(
    userObserver,
    user,
    userAddress,
    {
      distance: distance,
      rating: rating,
      cuisineChecked: cuisineChecked,
      orderBy: orderBy,
    }
  );
  const observer = useRef();
  const innerRefData = useRef();
  const lastUser = useCallback(
    (node) => {
      if (isLoading) {
        return;
      }
      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setUserObserver(innerRefData.current);
        }
      });
      if (node) {
        observer.current.observe(node);
      }
    },
    [isLoading]
  );

  useEffect(() => {
    document.title = "Chefswap | Find swaps";
  }, []);

  useEffect(() => {
    if (user == loading) {
      return;
    }
    fetchSpecific(user.accountUid, "address", setUserAddress);
  }, [user]);

  if (user == loading || userAddress == null) {
    return <></>;
  }

  /* FUNCTIONS FOR FILTER FORM */
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
    <OnlyLoggedIn>
      <div className="find-swap-page">
        <div className="find-swap-content">
          {/* New FilterForm */}
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

          <SwapResultsContainer
            searchState={filterForDisplay(searchState)}
            searchDispatch={searchDispatch}
            setOrderBy={setOrderBy}
            user={user}
            lastUser={lastUser}
            numLoadedUsers={searchState.length}
            innerRefData={innerRefData}
          />
        </div>
      </div>
    </OnlyLoggedIn>
  );
}
