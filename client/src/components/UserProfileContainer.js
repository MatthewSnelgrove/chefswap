import React from 'react';
import "./styles/UserProfileContainer.scss";
import Tag from './Tag';

//TODO: add a client side check to see if its the actual eprson and switch message button to edit button if thats the case
function UserProfileContainer(props) {
    const user = props.user;

    return (
        <div>
            <div className="user-container">
                <div className="profile_picture shift-upwards">
                    <img src={user.img} alt="User profile" className="profile-img" />
                    <span>{user.name}</span>
                </div>
                <button className="user-button">Message</button>
                <div className="user-data shift-upwards">
                    <div class="add-tags">Cuisine Preferences: {Object.keys(user.cuisinePrefrences).map((cuisine, index) =>
                        <Tag key={index} cuisine={cuisine} />
                    )}
                    </div>
                    <div className="add-tags">Cuisine Specialties: {Object.keys(user.cuisineSpecialties).map((cuisine, index) =>
                        <Tag key={index} cuisine={cuisine} />
                    )}</div>
                    <span className="bio">{user.bio}</span>
                    <span>Image Gallery:</span>
                    <div className="gallery">
                        <img alt="Food" src={user.img} />
                        <img alt="Food" src={user.img} />
                        <img alt="Food" src={user.img} />
                        <img alt="Food" src={user.img} />
                        <img alt="Food" src={user.img} />
                        <img alt="Food" src={user.img} />
                        <img alt="Food" src={user.img} />
                        <img alt="Food" src={user.img} />
                        <img alt="Food" src={user.img} />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default UserProfileContainer