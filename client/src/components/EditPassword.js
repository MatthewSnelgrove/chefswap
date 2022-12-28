import { React } from "react"
import "./styles/EditPassword.css"
import { changePassword } from "../utils/changeFunctions"
import { useUser } from "./useUser"
import ProfilePicture from "./ProfilePicture"

function onSubmit(ev, Uid) {
  const password = ev.target[0].value;
  const confirmPassword = ev.target[1].value;

  if (password != confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  changePassword(Uid, password)
}

function EditPassword() {
  const user = useUser()
  const globalVars = global.config

  if (user == globalVars.userStates.loading) return (<></>)

  return (
    <form onSubmit={(e) => onSubmit(e, user.accountUid)} className="edit-container">
      <div className="edit-item" style={{ marginTop: "35px" }}>
        <div>
          <ProfilePicture pfpLink={user.pfpLink} />
        </div>
        <div >
          <h1 style={{ marginTop: "10px", fontSize: "25px", marginBottom: "10px" }}>
            {user.username}
          </h1>
          {/* <div className="info-text" style={{fontWeight: "600", marginTop: "25px"}}>Change Password</div>  */}
          <div className="info-text">A valid password contains atleast 1 lowercase, 1 uppercase, 1 number, and is 8 to 50 characters long</div>
        </div>
      </div>
      <div className="edit-item">
        <label>
          New Password
        </label>
        <input id="password" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,50}$" type="password" required></input>
      </div>
      <div className="edit-item">
        <label>
          Confirm Password
        </label>
        <div>
          <input type="password" className="no-check" id="confirm" style={{ width: "100%" }}></input>
          <button className="submitBtn" style={{ marginTop: "20px" }}>Submit</button>
          {/* <button className="submitBtn" style={{marginTop: "25px", marginBottom: "25px"}}>Change Password</button> */}
        </div>
      </div>
    </form>
  )
}

export default EditPassword;
