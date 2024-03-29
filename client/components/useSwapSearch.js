import { useEffect, useReducer, useState } from "react";
import { getAllUsers } from "../utils/fetchFunctions";
import global_vars from "../utils/config";

function searchReducer(state, action) {
  switch (action.type) {
    case "new-swap": {
      return state.filter(
        (filterUser) => filterUser.profile.accountUid != action.payload
      );
    }
    case "user-scroll": {
      return [...state, ...action.payload];
    }
    case "change-query": {
      return action.payload;
    }
  }
}

function returnEmptyIfNull(string, value) {
  if (value != null) {
    return string;
  }
  return "";
}

function loadedData(setLoading, loadingDispatch, newData, type) {
  loadingDispatch({ type: type, payload: newData });
  setLoading(false);
  console.log("getting new users");
}

//This violates open/close principle not really sure how to fix ths
function getOrderByString(orderBy, distance, rating, accountUid) {
  if (orderBy == "distanceAsc" || orderBy == "distanceDesc") {
    return `&key[accountUid]=${accountUid}&key[distance]=${distance * 1000}`;
  } else {
    return `&key[accountUid]=${accountUid}&key[avgRating]=${rating}`;
  }
}

export function useSwapSearch(lastUser, user, userAddress, queryValues) {
  const [state, dispatch] = useReducer(searchReducer, []);
  const [loading, setLoading] = useState(false);
  const [isLastUser, setLastUser] = useState(false);

  useEffect(() => {
    if (user == global_vars.userStates.loading || userAddress == null) {
      return;
    }
    getAllUsers(
      userAddress.latitude,
      userAddress.longitude,
      `${queryValues.cuisineChecked
        .map((e) => "&cuisineSpeciality=" + e)
        .join("")}&orderBy=${queryValues.orderBy}${returnEmptyIfNull(
        `&minRating=${queryValues.rating}`,
        queryValues.rating
      )}${returnEmptyIfNull(
        `&maxDistance=${queryValues.distance * 1000}`,
        queryValues.distance
      )}&limit=8`,
      (data) => loadedData(setLoading, dispatch, data, "change-query")
    );
  }, [userAddress]);

  //make sure to include &minRating=${queryValues.rating}
  //make sure to include &maxDistance=${queryValues.distance * 1000}
  //TODO: fix setLastUser(false) based off of error data
  useEffect(() => {
    if (
      user == global_vars.userStates.loading ||
      userAddress == null ||
      loading
    ) {
      return;
    }
    getAllUsers(
      userAddress.latitude,
      userAddress.longitude,
      `${queryValues.cuisineChecked
        .map((e) => "&cuisineSpeciality=" + e)
        .join("")}&orderBy=${queryValues.orderBy}${returnEmptyIfNull(
        `&minRating=${queryValues.rating}`,
        queryValues.rating
      )}${returnEmptyIfNull(
        `&maxDistance=${queryValues.distance * 1000}`,
        queryValues.distance
      )}&limit=8`,
      (data) => {
        loadedData(setLoading, dispatch, data, "change-query");
        if (data) {
          setLastUser(false);
        }
      }
    );
  }, Object.values(queryValues));

  useEffect(() => {
    if (
      user == global_vars.userStates.loading ||
      userAddress == null ||
      isLastUser
    ) {
      return;
    }
    setLoading(true);
    getAllUsers(
      userAddress.latitude,
      userAddress.longitude,
      `${queryValues.cuisineChecked
        .map((e) => "&cuisineSpeciality=" + e)
        .join("")}&orderBy=${queryValues.orderBy}${getOrderByString(
        queryValues.orderBy,
        lastUser.distance,
        lastUser.rating,
        lastUser.accountUid
      )}${returnEmptyIfNull(
        `&minRating=${queryValues.rating}`,
        queryValues.rating
      )}${returnEmptyIfNull(
        `&maxDistance=${queryValues.distance * 1000}`,
        queryValues.distance
      )}&limit=8`,
      (data) => {
        console.log(data);
        loadedData(setLoading, dispatch, data, "user-scroll");
        if (data && data.length == 0) {
          setLastUser(true);
        }
      }
    );
  }, [lastUser]);

  return [state, dispatch, loading];
}
