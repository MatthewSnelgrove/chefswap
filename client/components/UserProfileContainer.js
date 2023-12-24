import { React } from "react";
import styles from "./styles/UserProfileContainer.module.css";
import pfpStyles from "./styles/ProfilePicture.module.css";
import Tag from "./Tag";
import ImageGallery from "./ImageGallery";
import { useUser } from "./useUser";
import ProfilePicture from "./ProfilePicture";
import global_vars from "../utils/config";

function UserProfileContainer(props) {
  const LoggedUser = useUser();
  const user = props.user;
  const globalVars = global_vars;
  const loading = globalVars.userStates.loading;

  if (LoggedUser == loading) return <></>;

  const isUser = LoggedUser != null && LoggedUser.accountUid == user.accountUid;

  function linkPage() {
    if (isUser) {
      window.location = globalVars.pages.editProfile;
    } else {
      window.location = globalVars.pages.myMessages;
    }
  }

  return (
    <div className={`${styles.user_container} full-contain`}>
      <div className={styles.profile_header}>
        <div className={styles.profile}>
          <ProfilePicture
            pfpLink={user.pfpLink}
            class={`${pfpStyles.large_profile_pic} ${pfpStyles.border_profile}`}
          />
          <span className={styles.username_tag}>{user.username}</span>
        </div>
        <div className={styles.edit_button_container}>
          <span className={styles.edit_profile_text}>Edit Profile</span>
          <button
            style={{ fontWeight: "600" }}
            className={styles.edit_button}
            onClick={linkPage}
          >
            <img
              style={{ width: "55px" }}
              src={isUser ? "/edit.svg" : "/chat.svg"}
            ></img>
          </button>
        </div>
      </div>
      <div className={styles.user_data}>
        <div style={{ marginTop: "8px" }} class={styles.add_tags}>
          <span className={styles.type_text}>Cuisine Preferences</span>
          <img
            className={styles.type_edit}
            style={{ width: "35px" }}
            src="/navigate.svg"
          ></img>
          {user.cuisinePreferences.length == 0 ? (
            <span style={{ fontStyle: "italic" }}>
              {isUser
                ? "You have no preferences"
                : "This user has no preferences"}
            </span>
          ) : (
            user.cuisinePreferences.map((cuisine, index) => (
              <Tag key={index} cuisine={cuisine} />
            ))
          )}
        </div>
        <div style={{ marginTop: "8px" }} className={styles.add_tags}>
          <span className={styles.type_text}>Cuisine Specialities</span>
          <img
            className={styles.type_edit}
            style={{ width: "35px" }}
            src="/navigate.svg"
          ></img>
          {user.cuisineSpecialities.length == 0 ? (
            <span style={{ fontStyle: "italic" }}>
              {isUser
                ? "You have no specialities"
                : "This user has no specialities"}
            </span>
          ) : (
            user.cuisineSpecialities.map((cuisine, index) => (
              <Tag key={index} cuisine={cuisine} />
            ))
          )}
        </div>
        <span style={{ marginTop: "5px" }} className={styles.bio}>
          {user.bio == "" ? (
            <span style={{ fontStyle: "italic", boxShadow: "10px" }}>
              {isUser ? "You have no bio" : "This user has no bio"}
            </span>
          ) : (
            user.bio
          )}
        </span>
        <div style={{ marginTop: "10px" }}>
          {user.images.length == 0 ? (
            <span style={{ fontStyle: "italic" }}>
              {isUser
                ? "You have no images in your gallery"
                : "This user has no images"}
            </span>
          ) : (
            <ImageGallery images={user.images} imgStyle={{ height: "450px" }} />
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfileContainer;
