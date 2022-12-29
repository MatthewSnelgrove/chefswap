import { toast } from "react-toastify"

export async function addNewPhoto(Uid, formData, linkToGo) {
  await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/images`, {
    method: "POST",
    body: formData,
    credentials: "include"
  })

  if (linkToGo) {
    window.location = linkToGo
  }
}

export async function deletePhoto(Uid, imgUid) {
  await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/images/${imgUid}`, {
    method: "DELETE",
    credentials: "include"
  })
    .then((response) => {
      toast.success(`Successfully removed photo`, {
        position: toast.POSITION.TOP_RIGHT
      });
    })
    .catch((reason) => console.log(reason))
}

export async function changeAddress(Uid, addressInfo) {
  await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/address`, {
    credentials: "include",
    method: "PUT",
    body: JSON.stringify(addressInfo),
    headers: { "Content-Type": "application/json" },
  })
    .catch((reason) => console.log(reason))
}

export async function changeEmail(Uid, emailInfo) {
  await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/email`, {
    credentials: "include",
    method: "PUT",
    body: JSON.stringify(emailInfo),
    headers: { "Content-Type": "application/json" },
  }).catch((reason) => console.log(reason));
}

export async function changeBio(Uid, bio) {
  await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/bio`, {
    credentials: "include",
    method: "PUT",
    body: JSON.stringify({ bio: bio }),
    headers: { "Content-Type": "application/json" },
  }).catch((reason) => console.log(reason));
}

export async function addPrefrence(Uid, prefrence) {
  await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/cuisinePreferences`, {
    credentials: "include",
    method: "POST",
    body: JSON.stringify({ cuisinePreference: prefrence }),
    headers: { "Content-Type": "application/json" },
  })
  .then((response) => {
    toast.success(`Successfully added ${prefrence} from your preferences`, {
      position: toast.POSITION.TOP_RIGHT
    });
  })
  .catch((reason) => console.log(reason))
}

export async function deletePrefrence(Uid, prefrence) {
  await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/cuisinePreferences/${prefrence}`, {
    credentials: "include",
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  })
    .catch((reason) => console.log(reason))

  toast.success(`Successfully removed ${prefrence} from your preferences`, {
    position: toast.POSITION.TOP_RIGHT
  });
}

export async function addSpeciality(Uid, speciality) {
  await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/cuisineSpecialities`, {
    credentials: "include",
    method: "POST",
    body: JSON.stringify({ cuisineSpeciality: speciality }),
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      toast.success(`Successfully added ${speciality} from your specialities`, {
        position: toast.POSITION.TOP_RIGHT
      });
    })
    .catch((reason) => console.log(reason))
}

export async function deleteSpeciality(Uid, speciality) {
  await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/cuisineSpecialities/${speciality}`, {
    credentials: "include",
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  })
    .then((response) => {
      toast.success(`Successfully removed ${speciality} from your specialities`, {
        position: toast.POSITION.TOP_RIGHT
      });
    })
    .catch((reason) => console.log(reason))
}

export async function changeUserProfile(Uid, profileForm, curLocation) {
  console.log(profileForm)
  
  await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/pfp`, {
    method: "PUT",
    body: profileForm,
    credentials: "include"
  })
    .catch((reason) => console.log(reason))

  window.location = curLocation
}

export async function changePassword(Uid, password) {
  await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/password`, {
    method: "PUT",
    body: JSON.stringify({ password: password }),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => console.log(response))
    .catch((reason) => console.log(reason));
}

export async function newSwapRequest(accountUid, requesteeUid, requesteeUsername) {
  await fetch(`http://localhost:3001/api/v1/swaps/${accountUid}`, {
    method: "POST",
    body: JSON.stringify({ requesteeUid: requesteeUid }),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })
  .then((response) => 
   toast.success(`Successfully sent a swap request to ${requesteeUsername}`, {
    position: toast.POSITION.TOP_RIGHT
   }))
  .catch((reason) => console.log(reason))
}

export async function changeSwapStatus(accountUid, requesteeUid, requesteeUsername, requestTimestamp, newStatus) {
  await fetch(`http://localhost:3001/api/v1/swaps/${accountUid}/${requesteeUid}/${requestTimestamp}/status`, {
    method: "PUT",
    body: JSON.stringify({ status: newStatus }),
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  })
  .then((response) => 
    toast.success(`Successfully changed ${requesteeUsername}'s swap status to ${newStatus}`, {
      position: toast.POSITION.TOP_RIGHT
    })
  )
  .catch((reason) => console.log(reason));
}

export async function cancelSwapRequest(accountUid, swapperUid, requesteeUsername, requestTimestamp) {
  await fetch(`http://localhost:3001/api/v1/swaps/${accountUid}/${swapperUid}/${requestTimestamp}`, {
    method: "DELETE",
    credentials: "include"
  })
  .then((response) =>     
    toast.success(`Successfully rejected ${requesteeUsername}'s swap request`, {
      position: toast.POSITION.TOP_RIGHT
    })
  )
  .catch((reason) => console.log(reason));
}