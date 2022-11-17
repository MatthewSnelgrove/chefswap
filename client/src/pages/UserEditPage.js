import { React } from 'react'
import EditListLink from '../components/EditListLink'
import OnlyLoggedIn from '../components/OnlyLoggedIn'
import "./styles/UserEditPage.css"


function UserEditPage(props) {
  return (
    <OnlyLoggedIn linkPage={"http://localhost:3000/login"} >
      <div className="form-container">
        <ul className="list-links">
          <EditListLink curSelected={props.name} link={"http://localhost:3000/accounts/edit"} listType={"EditProfile"} display={"Edit Profile"} />
          <EditListLink curSelected={props.name} link={"http://localhost:3000/accounts/password/change"} listType={"EditPassword"} display={"Change Password"} />
          <EditListLink curSelected={props.name} link={"http://localhost:3000/accounts/gallery"} listType={"EditGallery"} display={"Gallery"} />
          <EditListLink curSelected={props.name} link={"http://localhost:3000/accounts/personal"} listType={"EditPersonal"} display={"Personal Info"} />
        </ul>
        {props.renderType}
      </div>
    </OnlyLoggedIn>
  )
}

export default UserEditPage;
