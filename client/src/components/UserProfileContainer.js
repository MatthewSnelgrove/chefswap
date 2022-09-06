import React from 'react';
import "./UserProfileContainer.scss";

//TODO: add a client side check to see if its the actual eprson and switch message button to edit button if thats the case
function UserProfileContainer(props) {
    const user = props.user;
  
    return (
      <div>
        <div className="user-container">
            <div className="profile_picture">
                <img src={user.img} style={{width: 100, height: 100, borderRadius: 30}} />
                <span>{user.name}</span>
            </div>
            <div className="user-data">
                <span>Cuisine Preferences:</span>
                <span>Cuisine Specialties:</span>
                <span>Bio:</span>
                <span>Gallery:</span>
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
                    <img src={user.img}  />
                    <img src={user.img}  />
                    <img src={user.img}  />
                    <img src={user.img}  />
                    <img src={user.img}  />
                    <img src={user.img}  />
                    <img src={user.img}  />
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