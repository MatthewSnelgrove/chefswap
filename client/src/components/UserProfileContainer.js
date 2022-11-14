import { React, useState, useEffect } from "react";
import "./styles/UserProfileContainer.scss";
import Tag from "./Tag";
import { getUser } from "../pages/fetchFunctions";

//TODO: add a client side check to see if its the actual eprson and switch message button to edit button if thats the case

function UserProfileContainer(props) {
  const [LoggedUser, setLoggedUser] = useState(null);

  const user = props.user;

  useEffect(() => {
    getUser(setLoggedUser);
  }, []);

  const isUser = LoggedUser != null && LoggedUser.accountUid == user.accountUid;

  function linkPage() {
    if (LoggedUser == "N") {
      return;
    } else if (isUser) {
      window.location = "http://localhost:3000/accounts/edit";
    } else {
      window.location = "http://localhost:3000/my-messages";
    }
  }

  return (
    <div>
      <div className="user-container">
        <div className="profile_picture shift-upwards">
          <img src={user.pfpName} alt="User profile" className="profile-img" />
          <span>{user.username}</span>
        </div>
        <button className="user-button" onClick={linkPage}>
          <img src={isUser ? "edit.svg" : "chat.svg"}></img>
        </button>
        <div className="user-data shift-upwards">
          <div class="add-tags">
            Cuisine Preferences:{" "}
            {user.cuisinePreferences.map((cuisine, index) => (
              <Tag key={index} cuisine={cuisine} />
            ))}
          </div>
          <div className="add-tags">
            Cuisine Specialties:{" "}
            {user.cuisineSpecialities.map((cuisine, index) => (
              <Tag key={index} cuisine={cuisine} />
            ))}
          </div>
          <span className="bio">{user.bio}</span>
          <span>Image Gallery:</span>
          <div className="gallery">
            {user.images.map((img) => (
              <img src={img.imageName} alt="User image" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfileContainer;
