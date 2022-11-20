import { React, useEffect, useState } from "react";
import "./styles/EditProfile.css"
import TagEdit from "./TagEdit";
import { changeBio, deletePrefrence, addPrefrence, addSpecialty, deleteSpecialty, changeUserProfile } from "../pages/changeFunctions";
import { useUser } from "./useUser";
import ProfilePicture from "./ProfilePicture";

const curLocation = "http://localhost:3000/accounts/edit"
// async function changeProfile() {
//     const pickerOpts = {
//       types: [
//           {
//               description: "Images",
//               accept: {
//                   "image/*": [".png", ".jpeg", ".jpg"]
//               }
//           }
//       ],
//       multiple: false
//     }

//   const [Handle] = await window.showOpenFilePicker(pickerOpts)
//   const file = await Handle.getFile()
//   const url = URL.createObjectURL(file)
//   return url
// }


//Returns delete list and add list
// function getLists(curPrefrences, oldPrefrences) {
//   const newPrefrences = curPrefrences.filter((prefrence) => !oldPrefrences.some((element) => element == prefrence))
//   const deletePrefrences = oldPrefrences.filter((prefrence) => !curPrefrences.some((element) => element == prefrence))

//   return [newPrefrences, deletePrefrences]
// }


// //Remember to check empy imgFile
// function handleSubmit(ev, Uid, userPrefrences, userSpecialties, bio, imgFile, oldSpecialties, oldPrefrences) {
//   // console.log(Uid, userPrefrences, userSpecialties, bio, imgFile.get("file"))
//   //changeBio(Uid, {bio: bio})
//   const [newPrefrences, deletePrefrences] = getLists(userPrefrences, oldPrefrences)

//   newPrefrences.map((prefrence) => {
//     addPrefrence(Uid, {cuisinePreference: prefrence})
//   })

//   deletePrefrences.map((prefrence) => {
//     deletePrefrence(Uid, prefrence)
//   })

// }



function EditProfile(props) {
  const user = useUser()
  if (user == "loading") { return (<></>) }

  return (
    <div className="form-info">
      <div className="form-item" style={{ marginTop: "35px" }}>
        <div>
          <ProfilePicture pfpLink={user.pfpLink} />
        </div>
        <div>
          <h1 style={{ fontSize: "22px", marginBottom: "0px" }}>{user.username}</h1>
          <form id="image-form">
            <label className="profile-pic-button" onSubmit={(e) => { e.preventDefault() }}>
              Upload new Photo
              <input type="file" id="file" accept="image/png, image/jpeg" onChange={(e) => {
                if (e.target.value == "") { return }
                const profile_pic = document.getElementById("profile-pic")
                profile_pic.src = window.URL.createObjectURL(e.target.files[0])
                const formData = new FormData
                formData.append("file", e.target.files[0])
                changeUserProfile(user.accountUid, formData)
              }} style={{ display: "none" }} />
            </label>
          </form>
          <div className="info-text" style={{ fontWeight: "600", marginTop: "20px" }}>Public Information</div>
          <div className="info-text">This information will be part of your public profile</div>
        </div>
      </div>
      <div className="form-item" style={{ marginTop: "15px" }}>
        <div>
          <label>Bio</label>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <textarea id="bio" defaultValue={user.bio}></textarea>
          <button className="submitBtn" style={{ width: "min-content", whiteSpace: "nowrap", marginTop: "10px" }} onClick={(e) => {
            changeBio(user.accountUid, document.getElementById("bio").value)
            window.location = curLocation
          }}>Change Bio</button>
        </div>
      </div>
      <div className="form-item">
        <div>
          <label>Cuisine Prefrences</label>
        </div>
        <div style={{ position: "relative" }}>
          <TagEdit fillInList={user.cuisinePreferences} Uid={user.accountUid} addFunc={addPrefrence} deleteFunc={deletePrefrence} />
          <div className="info-text a-drop">Cuisine Prefrences tells other users what types of food you like</div>
        </div>
      </div>
      <div className="form-item">
        <div>
          <label>Cuisine Specialties</label>
        </div>
        <div style={{ position: "relative" }}>
          <TagEdit fillInList={user.cuisineSpecialities} Uid={user.accountUid} addFunc={addSpecialty} deleteFunc={deleteSpecialty} />
          <div className="info-text" style={{ marginTop: "4px" }}>Cuisine Specialties tells other users what types of food you like to make!</div>
        </div>
      </div>
    </div>
  )
}

export default EditProfile;