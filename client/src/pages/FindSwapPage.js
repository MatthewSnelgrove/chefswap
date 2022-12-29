import React, { useEffect, useState } from "react";
import FilterForm from "../components/FilterForm";
import OnlyLoggedIn from "../components/OnlyLoggedIn";
import SwapResultsContainer from "../components/SwapResultsContainer";
import "./styles/FindSwapPage.scss";
import { useUser } from "../components/useUser"
import { getAllUsers, fetchSpecific } from "../utils/fetchFunctions";

// distance: (user.profile.distance / 1000).toFixed(1),
// avg_rating: user.profile.avgRating
function filterForDisplay(users) {
  return users.map((user) => {
    return {
      avg_rating: user.profile.avgRating,
      cuisineSpecialities: user.profile.cuisineSpecialities,
      distance: (user.profile.distance / 1000).toFixed(1),
      pfpLink: user.profile.pfpLink,
      username: user.profile.username,
      accountUid: user.profile.accountUid
    }
  })
}

/**
 * /find-swaps page
 * @use Navbar, FilterForm, SwapsResultsContainer
 */
export default function FindSwapPage(props) {
  const user = useUser();
  const loading = global.config.userStates.loading
export default function FindSwapPage(props) {
  const user = useUser();
  const loading = global.config.userStates.loading
  const [cuisineTyped, setCuisineTyped] = useState("");
  const [cuisineChecked, setCuisineChecked] = useState([]);
  const [rating, setRating] = useState(1);
  const [distance, setDistance] = useState(100);
  const [users, setUsers] = useState([]);
  const [userAddress, setUserAddress] = useState(null);

  useEffect(() => {
    document.title = "Chefswap | Find swaps";
  }, []);

  //TODO: set default values
  useEffect(() => {
    if (user == loading) {return}
    fetchSpecific(user.accountUid, "address").then((address) => {
      setUserAddress(address)
      getAllUsers(address.latitude, address.longitude, user.accountUid, null, setUsers)
    })
  }, [user])

  useEffect(() => {
    if (user == loading || userAddress == null) {return}
    getAllUsers(userAddress.latitude, userAddress.longitude, user.accountUid, `&maxDistance=${distance * 1000}&minRating=${rating}${cuisineChecked.map(e => "&cuisineSpeciality=" + e).join("")}`, setUsers)
  }, [cuisineChecked, distance, rating])


  if (user == loading){ return (<></>) }


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

  function sendAllChange() {
    
  }

  return (
    <OnlyLoggedIn>
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
            users={filterForDisplay(users)}
            setUsers={setUsers}
            user={user}
          />
        </div>
      </div>
    </OnlyLoggedIn>
  );
}
