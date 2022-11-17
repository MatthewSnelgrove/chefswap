import { React } from 'react';
import "./styles/UserProfileContainer.css";
import Tag from './Tag';
import ImageGallery from './ImageGallery';
import { useUser } from "./useUser"
import ProfilePicture from './ProfilePicture';

function UserProfileContainer(props) {
  const LoggedUser = useUser()
  const user = props.user;

  if (LoggedUser == null) return (<></>)

  const isUser = (LoggedUser != null && LoggedUser.accountUid == user.accountUid)


  function linkPage() {
    if (isUser) {
      window.location = "http://localhost:3000/accounts/edit"
    }
    else {
      window.location = "http://localhost:3000/my-messages"
    }
  }
}

return (
  <div>
    <div className="user-container">
      <div className="profile_picture">
        <ProfilePicture pfpLink={user.pfpLink} class="profile-img" />
        <span>{user.username}</span>
      </div>
      {LoggedUser == "N" ? <></> : <button className="user-button" onClick={linkPage} ><img src={isUser ? "edit.svg" : "chat.svg"}></img></button>}
      <div className="user-data">
        <div class="add-tags">Cuisine Preferences: {user.cuisinePreferences.length == 0 ?
          <span style={{ fontStyle: "italic" }}>{isUser ? "You have no preferences" : "This user has no preferences"}</span>
          : user.cuisinePreferences.map((cuisine, index) =>
            <Tag key={index} cuisine={cuisine} />
          )}
        </div>
        <div className="add-tags">Cuisine Specialties: {user.cuisineSpecialities.length == 0 ?
          <span style={{ fontStyle: "italic" }}>{isUser ? "You have no specialties" : "This user has no specialties"}</span>
          : user.cuisineSpecialities.map((cuisine, index) =>
            <Tag key={index} cuisine={cuisine} />
          )}</div>
        <span className="bio">{user.bio == "" ? <span style={{ fontStyle: "italic" }}>{isUser ? "You have no bio" : "This user has no bio"}</span> : user.bio}</span>
        {/* <span>Image Gallery:</span> */}
        {user.images.length == 0 ?
          <span style={{ fontStyle: "italic" }}>{isUser ? "You have no images in your gallery" : "This user has no images"}</span>
          : <ImageGallery images={user.images} imgStyle={{ "height": "450px" }} />
        }
      </div>
    </div>
  </div>
      </div >
    </div >
  );
}

export default UserProfileContainer;
