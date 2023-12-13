import React from "react";
import styles from "./styles/ProfilePicture.module.css";

function ProfilePicture(props) {
  return (
    <>
      <img
        src={props.pfpLink ? props.pfpLink : "/corn.jpg"}
        id="profile-pic"
        style={props.style == null ? {} : props.style}
        className={props.class == null ? styles.profile_pic : props.class}
      />
    </>
  );
}

export default ProfilePicture;
