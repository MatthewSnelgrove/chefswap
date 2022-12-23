import { React, useEffect } from "react";
import EditListLink from "../components/EditListLink";
import OnlyLoggedIn from "../components/OnlyLoggedIn";
import "./styles/UserEditPage.css";

function UserEditPage(props) {
  useEffect(() => {
    document.title = "Chefswap | Edit profile";
  }, []);

  const pages = global.config.pages;

  return (
    <OnlyLoggedIn>
      <div className="form-container full-contain">
        <ul className="list-links">
          <EditListLink curSelected={props.name} link={pages.editProfile} listType={"EditProfile"} display={"Edit Profile"} smallImg={"../person.svg"} />
          <EditListLink curSelected={props.name} link={pages.editPassword} listType={"EditPassword"} display={"Change Password"} smallImg={"../lock.svg"}/>
          <EditListLink curSelected={props.name} link={pages.editGallery} listType={"EditGallery"} display={"Gallery"} smallImg={"../photo.svg"}/>
          <EditListLink curSelected={props.name} link={pages.editPersonal} listType={"EditPersonal"} display={"Personal Info"} smallImg={"../key.svg"}/>
        </ul>
        {props.renderType}
      </div>
    </OnlyLoggedIn>
  );
}

export default UserEditPage;
