import {React, useEffect, useState} from "react"
import "./styles/EditPassword.css"
import { getUser, fetchSpecific} from '../pages/fetchFunctions';

function EditPassword() {

    //if (user == null || user == "N") return (<></>)
    //console.log(user.accountUid)
    
    return (
        <div className="edit-container">
            <div className="edit-item" style={{marginTop: "35px"}}>
                <div>
                    <img src="../corn.jpg" className="profile-pic"></img>
                </div>
                <div style={{marginBottom: "-10px"}}>
                    <h1 style={{marginTop: "10px" ,fontSize: "25px"}}>
                        Dick
                    </h1>
                    <div className="info-text" style={{fontWeight: "600", marginTop: "30px"}}>Change Password</div> 
                    <div className="info-text">You can change your password without changing your personal information</div>
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
                    Confirm New Password
                </label>
                <div>
                    <input style={{width: "100%"}}></input>
                    <div className="info-text" style={{fontWeight: "600", marginTop: "30px"}}>Personal Information</div> 
                    <div className="info-text">This information will not be part of your public profile</div>
                    {/* <button className="submitBtn" style={{marginTop: "25px", marginBottom: "25px"}}>Change Password</button> */}
                </div>
            </div>
            <div className="edit-item" style={{marginTop: "15px"}}>
                <div>
                    <label>Address</label>
                </div>
                <input></input>
            </div> 
            <div className="edit-item" style={{marginBottom: "20px"}}>
            <div>
                <label>Email</label>
            </div>
            <div>
                <input style={{width: "100%"}}></input>
                <button className="submitBtn" style={{marginTop: "20px"}}>Submit</button>
            </div>
        </div>
        </div>
    )
}

export default EditPassword;