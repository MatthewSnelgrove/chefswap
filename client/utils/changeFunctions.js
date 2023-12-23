import { toast } from "react-toastify";
import global_vars from "./config";
const homepage = "http://localhost:3000/";

//TODO: make a errorMessage for each function that uses makeChangeRequestWithToast
async function makeChangeRequestWithToast(
  url,
  params,
  acceptMessage,
  errorMessage
) {
  await fetch(url, params)
    .then((response) => {
      toast.success(acceptMessage, { position: toast.POSITION.TOP_RIGHT });
    })
    .catch((error) => {
      console.error(error);
    });
}

export async function addNewPhoto(Uid, formData, linkToGo) {
  await fetch(`${global_vars.serverUrl}/accounts/${Uid}/images`, {
    method: "POST",
    body: formData,
    credentials: "include",
  })
    .then((response) => {
      window.location = linkToGo;
    })
    .catch((reason) => {
      console.error(reason);
    });
}

export async function deletePhoto(Uid, imgUid) {
  await makeChangeRequestWithToast(
    `${global_vars.serverUrl}/accounts/${Uid}/images/${imgUid}`,
    {
      method: "DELETE",
      credentials: "include",
    },
    `Successfully removed photo`
  );
}

export async function changeAddress(Uid, addressInfo) {
  return await fetch(`${global_vars.serverUrl}/accounts/${Uid}/address`, {
    credentials: "include",
    method: "PUT",
    body: JSON.stringify(addressInfo),
    headers: { "Content-Type": "application/json" },
  });
  // .catch((reason) => console.error(reason));
}

export async function changeEmail(Uid, emailInfo) {
  return await fetch(`${global_vars.serverUrl}/accounts/${Uid}/email`, {
    credentials: "include",
    method: "PUT",
    body: JSON.stringify(emailInfo),
    headers: { "Content-Type": "application/json" },
  });
  // .catch((reason) => console.error(reason));
}

export async function signoutUser() {
  const response = await fetch(`${global_vars.serverUrl}/session`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (response.ok) {
    window.location = homepage;
  }
}

export async function changeBio(Uid, bio) {
  await fetch(`${global_vars.serverUrl}/accounts/${Uid}/bio`, {
    credentials: "include",
    method: "PUT",
    body: JSON.stringify({ bio: bio }),
    headers: { "Content-Type": "application/json" },
  }).catch((reason) => console.error(reason));
}

export async function addPrefrence(Uid, prefrence) {
  await makeChangeRequestWithToast(
    `${global_vars.serverUrl}/accounts/${Uid}/cuisinePreferences`,
    {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ cuisinePreference: prefrence }),
      headers: { "Content-Type": "application/json" },
    },
    `Successfully added ${prefrence} from your preferences`
  );
}

export async function deletePrefrence(Uid, prefrence) {
  await makeChangeRequestWithToast(
    `${global_vars.serverUrl}/accounts/${Uid}/cuisinePreferences/${prefrence}`,
    {
      credentials: "include",
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    },
    `Successfully removed ${prefrence} from your preferences`
  );
}

export async function addSpeciality(Uid, speciality) {
  await makeChangeRequestWithToast(
    `${global_vars.serverUrl}/accounts/${Uid}/cuisineSpecialities`,
    {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ cuisineSpeciality: speciality }),
      headers: { "Content-Type": "application/json" },
    },
    `Successfully added ${speciality} from your specialities`
  );
}

export async function deleteSpeciality(Uid, speciality) {
  await makeChangeRequestWithToast(
    `${global_vars.serverUrl}/accounts/${Uid}/cuisineSpecialities/${speciality}`,
    {
      credentials: "include",
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    },
    `Successfully removed ${speciality} from your specialities`
  );
}

export async function changeUserProfile(Uid, profileForm, curLocation) {
  await fetch(`${global_vars.serverUrl}/accounts/${Uid}/pfp`, {
    method: "PUT",
    body: profileForm,
    credentials: "include",
  })
    .then((response) => (window.location = curLocation))
    .catch((reason) => console.error(reason));
}

export async function changePassword(Uid, password) {
  return await fetch(`${global_vars.serverUrl}/accounts/${Uid}/password`, {
    method: "PUT",
    body: JSON.stringify({ password: password }),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  // .then((response) => console.log(response))
  // .catch((reason) => console.error(reason));
}

export async function newSwapRequest(
  accountUid,
  requesteeUid,
  requesteeUsername
) {
  await makeChangeRequestWithToast(
    `${global_vars.serverUrl}/swaps/${accountUid}`,
    {
      method: "POST",
      body: JSON.stringify({ requesteeUid: requesteeUid }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
    `Successfully sent a swap request to ${requesteeUsername}`
  );
}

export async function changeSwapStatus(
  accountUid,
  requesteeUid,
  requesteeUsername,
  requestTimestamp,
  newStatus
) {
  await makeChangeRequestWithToast(
    `${global_vars.serverUrl}/swaps/${accountUid}/${requesteeUid}/${requestTimestamp}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status: newStatus }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
    `Successfully changed ${requesteeUsername}'s swap status to ${newStatus}`
  );
}

export async function cancelSwapRequest(
  accountUid,
  swapperUid,
  requesteeUsername,
  requestTimestamp
) {
  await makeChangeRequestWithToast(
    `${global_vars.serverUrl}/swaps/${accountUid}/${swapperUid}/${requestTimestamp}`,
    {
      method: "DELETE",
      credentials: "include",
    },
    `Successfully rejected ${requesteeUsername}'s swap request`
  );
}

export async function changeAvgRating(
  accountUid,
  swapperUid,
  rating,
  requesteeUsername
) {
  await makeChangeRequestWithToast(
    `${global_vars.serverUrl}/ratings/${accountUid}/${swapperUid}`,
    {
      method: "PUT",
      body: JSON.stringify({ rating: rating }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
    `Successfully rated swap with ${requesteeUsername}`
  );
}
