import {React, useEffect, useState} from 'react'
import "./styles/UserEditPage.css"
import EditProfile from '../components/EditProfile'
import EditPassword from '../components/EditPassword'
import EditGallery from '../components/EditGallery'
import EditPersonal from '../components/EditPersonal'

function UserEditPage(props) {
  const type = props.type
  const StyleSelected = {borderLeft: "2px solid black", backgroundColor: "white"}


  const renderInContainer = {
    edit_profile: <EditProfile />, 
    change_password: <EditPassword  />,
    edit_gallery: <EditGallery />,
    edit_personal: <EditPersonal />
  }
  
  function linkTo(specificType, link) {
    if (type != specificType) {
      window.location = link
    }
  }

  return (
    <div className="form-container">
      {/* may want to make component based of this */}
      <ul className="list-links">
        <li style={type == "edit_profile" ? StyleSelected: {}}>
          <a className="full-a" onClick={(e) => linkTo("edit_profile", "http://localhost:3000/accounts/edit")}/>
          <div style={type == "edit_profile" ? {fontWeight: "600"}: {}}>
            Edit Profile
          </div>
        </li>
        <li style={type == "change_password" ? StyleSelected: {}}>
          <a className="full-a" onClick={(e) => linkTo("change_password", "http://localhost:3000/accounts/password/change")}/>
          <div style={type == "change_password" ? {fontWeight: "600"}: {}}>
            Change Password
          </div>
        </li>
        <li className="bottom-li" style={type == "edit_gallery" ? StyleSelected: {}}>
          <a className="full-a" onClick={(e) => linkTo("edit_gallery", "http://localhost:3000/accounts/gallery")}/>
          <div style={type == "edit_gallery" ? {fontWeight: "600"}: {}}>
            Edit Gallery
          </div>
        </li>
        <li className="bottom-li" style={type == "edit_personal" ? StyleSelected: {}}>
          <a className="full-a" onClick={(e) => linkTo("edit_personal", "http://localhost:3000/accounts/personal")}/>
          <div style={type == "edit_personal" ? {fontWeight: "600"}: {}}>
            Edit Personal Info
          </div>
        </li>
      </ul>
      {renderInContainer[type]}
    </div>
  )
}

export default UserEditPage