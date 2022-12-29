const homepage = "http://localhost:3000/";

export async function fetchLogin(password, username) {
  const response = await fetch(`http://localhost:3001/api/v1/session`, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({
      username: username,
      password: password
    }),
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  })

  return response;
}

export async function fetchUserFromUid(Uid) {
  const response = await fetch(`http://localhost:3001/api/v1/accounts/${Uid}`);
  const json = await response.json();

  return json;
}

export async function fetchUserFromUidWithDistance(Uid, longitude, latitude) {
  const response = await fetch(`http://localhost:3001/api/v1/accounts/${Uid}?includeDistanceFrom[latitude]=${latitude}&includeDistanceFrom[longitude]=${longitude}`);
  const json = await response.json();

  return json;
}

export async function fetchSpecific(Uid, specific) {
  const response = await fetch(
    `http://localhost:3001/api/v1/accounts/${Uid}/${specific}`,
    {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );
  const json = await response.json();
  return json;
}

//this is the function you use to get user
export function getUser(userfunc) {
  const userPromise = fetchUser().then((userPromise) => {
    return userPromise;
  });

  userPromise.then((user) => {

    if (user === 404) {
      console.log("Returning N for user")
      userfunc("N")
      return;
    }

    userfunc(user.profile);
  });
}

export async function signupUser(userObj) {
  console.log(userObj);

  const response = await fetch("http://localhost:3001/api/v1/accounts", {
    method: "POST",
    mode: "cors",
    body: JSON.stringify(userObj),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    return response;
  }

  console.log("created user")
  fetchLogin(userObj.password, userObj.profile.username).then((user) => {
    console.log(user)
    window.location = homepage
  })
}

export async function signoutUser() {
  const response = await fetch(`http://localhost:3001/api/v1/session`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (response.status == 204) {
    window.location = homepage;
  }
}

export async function fetchUser() {

  const response = await fetch(`http://localhost:3001/api/v1/session`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    return response;
  }

  const json = await response.json();

  return fetchUserFromUid(json.accountUid);
}


export async function getAllUsers(latitude, longitude, accountUid, filter, setFunc) {
  if (filter == null) {
    filter = ""
  }
  
  console.log(`http://localhost:3001/api/v1/accounts?includeDistanceFrom[latitude]=${latitude}&includeDistanceFrom[longitude]=${longitude}&matchableWith=${accountUid}${filter}`)

  const response = await fetch(`http://localhost:3001/api/v1/accounts?includeDistanceFrom[latitude]=${latitude}&includeDistanceFrom[longitude]=${longitude}&matchableWith=${accountUid}${filter}`, {
    method: "GET"
  })

  if (!response.ok) {
    return response;
  }

  const json = await response.json()

  console.log(json)
  setFunc(json)
}

export async function getUsersOfSwapStatus(user, status, setFunc) {
  const accountUid = user.accountUid
  const address = await fetchSpecific(accountUid, "address")
  const userSwaps = await getAllSwapsOfStatus(accountUid, status)
  const userPromise = await userSwaps.map(async (userSwap) => {
    if (userSwap.requesteeUid == accountUid) {
      return {profileData: await fetchUserFromUidWithDistance(userSwap.requesterUid, address.longitude, address.latitude), requestTimestamp: userSwap.requestTimestamp, requesterUid: userSwap.requesterUid}
    }
    return  {profileData: await fetchUserFromUidWithDistance(userSwap.requesteeUid, address.longitude, address.latitude), requestTimestamp: userSwap.requestTimestamp, requesterUid: userSwap.requesterUid}
  })
  const userData = await Promise.all(userPromise)
  setFunc(userData)
}

async function getAllSwapsOfStatus(accountUid, status, orderBy) {
  if (orderBy == null) {
    orderBy = "timeDesc"
  }

  const response = await fetch(`http://localhost:3001/api/v1/swaps/${accountUid}?status=${status}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })

  if (!response.ok) {
    return response;
  }

  const json = await response.json()
  
  return json
}

