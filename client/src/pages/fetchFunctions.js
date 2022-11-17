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

  if (!response.ok) {
    console.log("Failed to get user");
    return response.status;
  }

  const json = await response.json();

  return json;
}

export async function fetchUserFromUid(Uid) {
  const response = await fetch(`http://localhost:3001/api/v1/accounts/${Uid}`);
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
    return response.status;
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
    return response.status;
  }

  const json = await response.json();

  return fetchUserFromUid(json.accountUid);
}
