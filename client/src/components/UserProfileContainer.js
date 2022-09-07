import React from 'react';
import "./UserProfileContainer.scss";

//TODO: add a client side check to see if its the actual eprson and switch message button to edit button if thats the case
function UserProfileContainer(props) {
    const user = props.user;
  
    return (
      <div>
        <div className="user-container">
            <div className="profile_picture shift-upwards">
                <img src={user.img} className="profile-img" />
                <span>{user.name}</span>
            </div>
            <button className="user-button">Message</button>
            <div className="user-data shift-upwards">
                <span>Cuisine Preferences: {user.prefrences}</span>
                <span>Cuisine Specialties: {user.specialties}</span>
                <span>{user.bio}</span>
                <span>Image Gallery:</span>
                <div className="gallery">
                    <img src={user.img}  />
                    <img src={user.img}  />
                    <img src={user.img}  />
                    <img src={user.img}  />
                    <img src={user.img}  />
                    <img src={user.img}  />
                    <img src={user.img}  />
                    <img src={user.img}  />
                    <img src={user.img}  />
                </div>
            </div>
            
        </div>
      </div>
  )
}

export default UserProfileContainer