const homepage = "http://localhost:3000/"; // TODO: Change homepage link
import global_vars from "./config.js";

//TODO: change all of the console.errors to toasts
export async function fetchLogin(password, username) {
  const response = await fetch(`${global_vars.serverUrl}/session`, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({
      username: username,
      password: password,
    }),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  return response;
}

export async function fetchUserFromUid(Uid) {
  return makeRequestWithJSON(`${global_vars.serverUrl}/accounts/${Uid}`, {
    method: "GET",
  });
}

export async function fetchUserFromUidWithDistance(Uid, longitude, latitude) {
  return await makeRequestWithJSON(
    `${global_vars.serverUrl}/accounts/${Uid}?includeDistanceFrom[latitude]=${latitude}&includeDistanceFrom[longitude]=${longitude}`,
    {
      method: "GET",
    }
  );
}

export async function fetchSpecific(Uid, specific, setFunc) {
  if (setFunc) {
    try {
      const response = await fetch(
        `${global_vars.serverUrl}/accounts/${Uid}/${specific}`,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      const json = await response.json();
      setFunc(json);
      return json;
    } catch (error) {
      console.error(error);
    }
  }

  return await makeRequestWithJSON(
    `${global_vars.serverUrl}/accounts/${Uid}/${specific}`,
    {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function signupUser(userObj) {
  const response = await fetch("${global_vars.serverUrl}/accounts", {
    method: "POST",
    mode: "cors",
    body: JSON.stringify(userObj),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    return response;
  }

  fetchLogin(userObj.password, userObj.profile.username).then((user) => {
    console.log(user);
    window.location = homepage;
  });
}

export async function fetchUser() {
  const response = await fetch(`${global_vars.serverUrl}/session`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  console.log(response);

  if (response.status == 404) {
    return response;
  } else if (response.status != 200) {
    throw new Error(JSON.stringify(response));
  }

  const json = await response.json();

  return fetchUserFromUid(json.accountUid);
}

async function makeRequest(url, params) {
  const response = await fetch(url, params);

  if (!response.ok) {
    throw new Error(JSON.stringify(response), { cause: response.status });
  }

  return response;
}

async function makeRequestWithJSON(url, params) {
  const response = await makeRequest(url, params);
  const json = await response.json();

  return json;
}

export async function getAllUsers(latitude, longitude, filter, setFunc) {
  if (filter == null) {
    filter = "";
  }

  try {
    console.log(
      `${global_vars.serverUrl}/accounts?includeDistanceFrom[latitude]=${latitude}&includeDistanceFrom[longitude]=${longitude}${filter}`
    );
    const response = await fetch(
      `${global_vars.serverUrl}/accounts?includeDistanceFrom[latitude]=${latitude}&includeDistanceFrom[longitude]=${longitude}${filter}`
    );
    const json = await response.json();
    if (setFunc) {
      setFunc(json);
    } else {
      return json;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function getUsersOfSwapStatus(user, status, setFunc) {
  try {
    const accountUid = user.accountUid;
    const address = await fetchSpecific(accountUid, "address");
    const userSwaps = await getAllSwapsOfStatus(accountUid, status);
    const userPromise = await userSwaps.map(async (userSwap) => {
      if (userSwap.requesteeUid == accountUid) {
        return {
          profileData: await fetchUserFromUidWithDistance(
            userSwap.requesterUid,
            address.longitude,
            address.latitude
          ),
          requestTimestamp: userSwap.requestTimestamp,
          requesterUid: userSwap.requesterUid,
        };
      }
      return {
        profileData: await fetchUserFromUidWithDistance(
          userSwap.requesteeUid,
          address.longitude,
          address.latitude
        ),
        requestTimestamp: userSwap.requestTimestamp,
        requesterUid: userSwap.requesterUid,
      };
    });
    const userData = await Promise.all(userPromise);
    if (setFunc) {
      setFunc(userData);
    } else {
      return userData;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function getAllSwapsOfStatus(accountUid, status, orderBy) {
  if (orderBy == null) {
    orderBy = "";
  }

  return await makeRequestWithJSON(
    `${global_vars.serverUrl}/swaps/${accountUid}?status=${status}&orderBy=timeDesc`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
}

export async function getRatings(accountUid, swapperUid) {
  return await makeRequestWithJSON(
    `${global_vars.serverUrl}/ratings/${accountUid}/${swapperUid}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
}

export async function getMultipleRatings(userDateList, user, setFunc) {
  const userRatingsPromises = await Object.entries(userDateList).map(
    async (swapData) => {
      const userRating = await getRatings(
        user.accountUid,
        swapData[1][0].accountUid
      ).catch((err) => {});
      return [swapData[1][0].username, userRating];
    }
  );

  const userRatings = await Promise.all(userRatingsPromises);
  setFunc(Object.fromEntries(userRatings));
}
