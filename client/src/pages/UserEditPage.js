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
          <EditListLink
            curSelected={props.name}
            link={pages.editProfile}
            listType={"EditProfile"}
            display={"Edit Profile"}
          />
          <EditListLink
            curSelected={props.name}
            link={pages.editPassword}
            listType={"EditPassword"}
            display={"Change Password"}
          />
          <EditListLink
            curSelected={props.name}
            link={pages.editGallery}
            listType={"EditGallery"}
            display={"Gallery"}
          />
          <EditListLink
            curSelected={props.name}
            link={pages.editPersonal}
            listType={"EditPersonal"}
            display={"Personal Info"}
          />
        </ul>
        {props.renderType}
      </div>
    </OnlyLoggedIn>
  );
}

export default UserEditPage;
