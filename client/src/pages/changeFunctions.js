
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
}

export async function changeAddress(Uid, addressInfo) {
    await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/address`, {
        credentials: "include",
        method: "PUT",
        body: JSON.stringify(addressInfo),
        headers: { "Content-Type": "application/json" },
    }).catch((reason) => console.log(reason))
}

export async function changeEmail(Uid, emailInfo) {
    await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/email`, {
        credentials: "include",
        method: "PUT",
        body: JSON.stringify(emailInfo),
        headers: { "Content-Type": "application/json" },
    }).catch((reason) => console.log(reason))
}

export async function changeBio(Uid, bio) {
    await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/bio`, {
        credentials: "include",
        method: "PUT",
        body: JSON.stringify(bio),
        headers: { "Content-Type": "application/json" },
    }).catch((reason) => console.log(reason))
}

export async function addPrefrence(Uid, prefrence) {
    await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/cuisinePreferences`, {
        credentials: "include",
        method: "POST",
        body: JSON.stringify(prefrence),
        headers: { "Content-Type": "application/json" },
    }).catch((reason) => console.log(reason))
}

export async function deletePrefrence(Uid, prefrence) {
    await fetch(`http://localhost:3001/api/v1/accounts/${Uid}/cuisinePreferences/${prefrence}`, {
        credentials: "include",
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    }).catch((reason) => console.log(reason))
}