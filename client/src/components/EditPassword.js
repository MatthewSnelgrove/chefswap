import {React, useEffect, useState} from "react"
import "./styles/EditPassword.css"
import { getUser } from "../pages/fetchFunctions"

function EditPassword() {

    const [username, setUsername] = useState(null)

    useEffect(() => {
        function setProperties(user) {
            setUsername(user.username)
        }

        getUser(setProperties)
    }, [])

    if (username == null) return (<></>)

    return (
        <form className="edit-container">
            <div className="edit-item" style={{marginTop: "35px"}}>
                <div>
                    <img src="../corn.jpg" className="profile-pic"></img>
                </div>
                <div >
                    <h1 style={{marginTop: "10px" ,fontSize: "25px"}}>
                        {username}
                    </h1>
                </div>
            </div>
            <div className="edit-item"> 
                <label>
                    Old Password
                </label>
                <input></input>
            </div>
            <div className="edit-item"> 
                <label>
                    New Password
                </label>
                <input></input>
            </div>
            <div className="edit-item"> 
                <label>
                    Confirm Password
                </label>
                <div>
                    <input style={{width: "100%"}}></input>
                    <button className="submitBtn" style={{marginTop: "20px"}}>Submit</button>
                    {/* <button className="submitBtn" style={{marginTop: "25px", marginBottom: "25px"}}>Change Password</button> */}
                </div>
            </div>
        </form>
    )
}

export default EditPassword;