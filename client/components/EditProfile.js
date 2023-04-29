import { React } from "react";
import styles from "./styles/EditProfile.module.css";
import TagEdit from "./TagEdit";
import {
  changeBio,
  deletePrefrence,
  addPrefrence,
  addSpeciality,
  deleteSpeciality,
  changeUserProfile,
} from "../utils/changeFunctions";
import { useUser } from "./useUser";
import ProfilePicture from "./ProfilePicture";
import pfpStyles from "./styles/ProfilePicture.module.css";
import global_vars from "../utils/config";

function EditProfile(props) {
  const user = useUser();
  const globalVars = global_vars;
  const curLocation = globalVars.pages.editProfile;

  if (user == globalVars.userStates.loading) {
    return <></>;
  }
  return (
    <div className={styles.form_info}>
      <div className={`${styles.form_item} ${styles.profile_container}`}>
        <div>
          <ProfilePicture
            pfpLink={user.pfpLink}
            class={pfpStyles.large_profile_pic}
          />
        </div>
        <div>
          <h1 className={styles.username_place}>{user.username}</h1>
          <form id="image-form">
            <label
              className={styles.profile_pic_button}
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              Upload new Photo
              <input
                type="file"
                id="file"
                accept="image/png, image/jpeg"
                onChange={(e) => {
                  if (e.target.value == "") {
                    return;
                  }
                  const formData = new FormData();
                  formData.append("image", e.target.files[0]);
                  changeUserProfile(user.accountUid, formData, curLocation);
                }}
                style={{ display: "none" }}
              />
            </label>
          </form>
        </div>
      </div>
      <div className={styles.form_item} style={{ marginTop: "45px" }}>
        <div>
          <label>Bio</label>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <textarea className={styles.bio} defaultValue={user.bio}></textarea>
          <button
            className={`${styles.change_bio_button} base-btn-lightblue`}
            onClick={(e) => {
              changeBio(user.accountUid, document.getElementById("bio").value);
              window.location = curLocation;
            }}
          >
            Change Bio
          </button>
        </div>
      </div>
      <div className={styles.form_item} style={{ marginTop: "75px" }}>
        <div>
          <label>Cuisine Prefrences</label>
        </div>
        <div style={{ position: "relative" }}>
          <TagEdit
            fillInList={user.cuisinePreferences}
            Uid={user.accountUid}
            addFunc={addPrefrence}
            deleteFunc={deletePrefrence}
            addPlaceholder={"Add Preferences +"}
          />
          <div className={`${styles.info_text} ${styles.a_drop}`}>
            Cuisine Prefrences tells other users what types of food you like
          </div>
        </div>
      </div>
      <div style={{ marginTop: "75px" }} className={styles.form_item}>
        <div>
          <label>Cuisine Specialties</label>
        </div>
        <div style={{ position: "relative" }}>
          <TagEdit
            fillInList={user.cuisineSpecialities}
            Uid={user.accountUid}
            addFunc={addSpeciality}
            deleteFunc={deleteSpeciality}
            addPlaceholder={"Add Specialties +"}
          />
          <div className={styles.info_text} style={{ marginTop: "4px" }}>
            Cuisine Specialties tells other users what types of food you like to
            make!
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
