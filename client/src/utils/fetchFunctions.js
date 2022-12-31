const homepage = "http://localhost:3000/";

//TODO: change all of the console.errors to toasts
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
  
  return response
}

export async function fetchUserFromUid(Uid) {
  return makeRequestWithJSON(`http://localhost:3001/api/v1/accounts/${Uid}`, {
    method: "GET"
  });
}

export async function fetchUserFromUidWithDistance(Uid, longitude, latitude) {
  return await makeRequestWithJSON(`http://localhost:3001/api/v1/accounts/${Uid}?includeDistanceFrom[latitude]=${latitude}&includeDistanceFrom[longitude]=${longitude}`, {
    method: "GET"
  })
}

export async function fetchSpecific(Uid, specific, setFunc) {
  if (setFunc) {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/${specific}`, {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const json = await response.json();
      setFunc(json)
      return json
    }
    catch(error) {
      console.error(error)
    }
  }
  
  return await makeRequestWithJSON(`http://localhost:3001/api/v1/accounts/${Uid}/${specific}`, {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
  });
}

export async function signupUser(userObj) {
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

  fetchLogin(userObj.password, userObj.profile.username).then((user) => {
    console.log(user)
    window.location = homepage
  })
}

export async function fetchUser() {

  const response = await fetch(`http://localhost:3001/api/v1/session`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })

  if (response.status == 404) {
    return response
  }
  else if (response.status != 200) {
    throw new Error(JSON.stringify(response))
  }

  const json = await response.json()

  return fetchUserFromUid(json.accountUid);
}

async function makeRequest(url, params) {
  const response = await fetch(url, params)

  if (!response.ok) {
    throw new Error(JSON.stringify(response))
  }

  return response
}

async function makeRequestWithJSON(url, params) {
  const response = await makeRequest(url, params)
  const json = await response.json()

  return json
}

export async function getAllUsers(latitude, longitude, accountUid, filter, setFunc) {
  if (filter == null) {
    filter = ""
  }

  try {
    const response = await fetch(`http://localhost:3001/api/v1/accounts?includeDistanceFrom[latitude]=${latitude}&includeDistanceFrom[longitude]=${longitude}&matchableWith=${accountUid}${filter}`);
    const json = await response.json();
    setFunc(json)
  }
  catch(error) {
    console.error(error)
  }
}

export async function getUsersOfSwapStatus(user, status, setFunc) {
  try {
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
  catch(error) {
    console.error(error)
  }
}

async function getAllSwapsOfStatus(accountUid, status, orderBy) {
  if (orderBy == null) {
    orderBy = ""
  }
  
  return await makeRequestWithJSON(`http://localhost:3001/api/v1/swaps/${accountUid}?status=${status}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
}

