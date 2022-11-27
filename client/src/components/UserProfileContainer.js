import { React } from 'react';
import "./styles/UserProfileContainer.css";
import Tag from './Tag';
import ImageGallery from './ImageGallery';
import { useUser } from "./useUser"
import ProfilePicture from './ProfilePicture';

function UserProfileContainer(props) {
  const LoggedUser = useUser()
  const user = props.user;
  const globalVars = global.config
  const loading = globalVars.userStates.loading

  if (LoggedUser == loading) return (<></>)

  const isUser = (LoggedUser != null && LoggedUser.accountUid == user.accountUid)

  function linkPage() {
    if (isUser) {
      window.location = globalVars.pages.editProfile
    }
    else {
      window.location = globalVars.pages.myMessages
    }
  }

  function linkToEditType() {
    window.location = globalVars.pages.editProfile
  }

  return (
    <div className="user-container full-contain">
      <div className="profile-header">
        <div className="profile">
          <ProfilePicture pfpLink={user.pfpLink} class="large-profile-pic border-profile" />
          <span className="username">{user.username}</span>
        </div>
        <div className="edit-button-container">
          <span className="edit-profile-text">Edit Profile</span>
          <button style={{fontWeight: "600"}}className="edit-button" onClick={linkPage}>
            <img style={{width: "55px"}} src={isUser ? "edit.svg" : "chat.svg"}></img>
          </button>
        </div>
      </div>
      <div className="user-data">
        <div style={{marginTop: "8px"}} class="add-tags">
          <span className="type-text">Cuisine Preferences</span> 
          <img className="type-edit" style={{width: "35px"}} src="navigate.svg"></img>
          {user.cuisinePreferences.length == 0 ? <span style={{ fontStyle: "italic" }}>{isUser ? "You have no preferences" : "This user has no preferences"}</span>
          : user.cuisinePreferences.map((cuisine, index) =>
            <Tag key={index} cuisine={cuisine} />
          )}
        </div>
        <div style={{marginTop: "8px"}} className="add-tags">
          <span className="type-text">Cuisine Specialties</span>  
          <img className="type-edit" style={{width: "35px"}} src="navigate.svg"></img>
          {user.cuisineSpecialities.length == 0 ?
          <span style={{ fontStyle: "italic" }}>{isUser ? "You have no specialties" : "This user has no specialties"}</span>
          : user.cuisineSpecialities.map((cuisine, index) =>
            <Tag key={index} cuisine={cuisine} />
          )}
        </div>
        <span style={{marginTop: "5px"}} className="bio">{user.bio == "" ? <span style={{ fontStyle: "italic", boxShadow: "10px"  }}>{isUser ? "You have no bio" : "This user has no bio"}</span> : user.bio}</span>
        <div style={{marginTop: "10px"}}>
        {user.images.length == 0 ?
          <span style={{ fontStyle: "italic" }}>{isUser ? "You have no images in your gallery" : "This user has no images"}</span>
          : <ImageGallery images={user.images} imgStyle={{ height: "450px"}} />
        }
        </div>
       
        
      </div>
    </div>
  )
}

export default UserProfileContainer;
