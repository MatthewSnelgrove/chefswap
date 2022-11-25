import React from "react";
import "./styles/ProfilePicture.css"
import "./styles/UserProfileContainer.css";
import "./styles/Navbar.scss";

function ProfilePicture(props) {
    return (
        <>
            <img src={props.pfpLink ? props.pfpLink: "../corn.jpg"} id="profile-pic"  className={props.class == null ? "profile-pic": props.class}></img>
        </>
    )
}

export default ProfilePicture;