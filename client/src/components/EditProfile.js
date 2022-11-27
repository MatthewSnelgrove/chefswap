import { React, useEffect, useState } from "react";
import "./styles/EditProfile.css"
import TagEdit from "./TagEdit";
import { changeBio, deletePrefrence, addPrefrence, addSpecialty, deleteSpecialty, changeUserProfile } from "../pages/changeFunctions";
import { useUser } from "./useUser";
import ProfilePicture from "./ProfilePicture";


function EditProfile(props) {
  const user = useUser()
  const globalVars = global.config
  const curLocation = globalVars.pages.editProfile

  if (user == globalVars.userStates.loading) { return (<></>) }
  return (
    <div className="form-info">
      <div className="form-item profile-container">
        <div>
          <ProfilePicture pfpLink={user.pfpLink} class="large-profile-pic" />
        </div>
        <div>
          <h1 className="username-place">{user.username}</h1>
          <form id="image-form">
            <label className="profile-pic-button" onSubmit={(e) => { e.preventDefault() }}>
              Upload new Photo
              <input type="file" id="file" accept="image/png, image/jpeg" onChange={(e) => {
                if (e.target.value == "") { return }
                const formData = new FormData
                formData.append("image", e.target.files[0])
                changeUserProfile(user.accountUid, formData, curLocation)
              }} style={{ display: "none" }} />
            </label>
          </form>
        </div>
      </div>
      <div className="form-item" style={{ marginTop: "45px" }}>
        <div>
          <label>Bio</label>
        </div>
        <div style={{ display: "flex", flexDirection: "column"}}>
          <textarea id="bio" defaultValue={user.bio}></textarea>
          <button className="change-bio-button" onClick={(e) => {
            changeBio(user.accountUid, document.getElementById("bio").value)
            window.location = curLocation
          }}>Change Bio</button>
        </div>
      </div>
      <div className="form-item" style={{marginTop: "75px"}}>
        <div>
          <label>Cuisine Prefrences</label>
        </div>
        <div style={{ position: "relative" }}>
          <TagEdit fillInList={user.cuisinePreferences} Uid={user.accountUid} addFunc={addPrefrence} deleteFunc={deletePrefrence} addPlaceholder={"Add Preferences +"} />
          <div className="info-text a-drop">Cuisine Prefrences tells other users what types of food you like</div>
        </div>
      </div>
      <div style={{marginTop: "75px"}} className="form-item">
        <div>
          <label>Cuisine Specialties</label>
        </div>
        <div style={{ position: "relative" }}>
          <TagEdit fillInList={user.cuisineSpecialities} Uid={user.accountUid} addFunc={addSpecialty} deleteFunc={deleteSpecialty} addPlaceholder={"Add Specialties +"} />
          <div className="info-text" style={{ marginTop: "4px" }}>Cuisine Specialties tells other users what types of food you like to make!</div>
        </div>
      </div>
    </div>
  )
}

export default EditProfile;