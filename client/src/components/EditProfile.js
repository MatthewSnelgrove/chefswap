import { check } from "prettier";
import { React, useEffect, useState } from "react";
import "./styles/EditProfile.css"
import TagEdit from "./TagEdit";
import { getUser } from '../pages/fetchFunctions';

const FoodItems = [
  "Indian",
  "Chinese",
  "Thai",
  "Mexican",
  "Indi",
  "Indonesian"
]

function addDropdown(target) {
  const dropdown = document.createElement("div")
  const parentElement = target.parentElement
  const beforeElement = parentElement.querySelector(".a-drop")
  dropdown.classList.add("dropdown-profile")
  parentElement.insertBefore(dropdown, beforeElement)
  return dropdown
}

function getQueryList(queryValue) {
  const queryRegex = RegExp(queryValue, "g")
  return FoodItems.filter((cuisineType) => queryRegex.test(cuisineType))
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}

function manageDropdown(dropdown, curText) {
  removeAllChildNodes(dropdown)
  const typesArr = curText.split(",")
  const FoodItems = getQueryList(typesArr.pop())
  
  if (FoodItems.length == 0) {return}
  
  FoodItems.map((FoodItem) => {
    const FoodElement = document.createElement("span")
    FoodElement.textContent = FoodItem
    dropdown.appendChild(FoodElement)
  })

  dropdown.firstChild.classList.add("dropdown-hl")
}

function shiftDropdownDown(dropdown) {
  if (dropdown.childElementCount <= 1) {return}

  const hlElement = dropdown.querySelector(".dropdown-hl")
  const nextElement = hlElement.nextElementSibling

  if (nextElement == null) {return}

  hlElement.classList.remove("dropdown-hl")
  nextElement.classList.add("dropdown-hl")
}

function shiftDropdownUp(dropdown) {
  if (dropdown.childElementCount <= 1) {return}

  const hlElement = dropdown.querySelector(".dropdown-hl")
  const previousElement = hlElement.previousElementSibling

  if (previousElement == null) {return}

  hlElement.classList.remove("dropdown-hl")
  previousElement.classList.add("dropdown-hl")
}

function onEnter(dropdown, textArea) {
  if (dropdown.childElementCount == 0) {return}

  const hlElement = dropdown.querySelector(".dropdown-hl")
  const typesArr = textArea.value.split(",")
  typesArr.pop()
  typesArr.push(hlElement.textContent.concat(","))
  textArea.value = typesArr.join(",")
}

function manageKeys(ev) {
  //up and down keycodes
  if (ev.keyCode == 40) {
    shiftDropdownDown(ev.target.nextElementSibling)
  }
  else if (ev.keyCode == 38) {
    shiftDropdownUp(ev.target.nextElementSibling)
  }
  else if (ev.keyCode == 13) {
    console.log("in there")
    onEnter(ev.target.nextElementSibling, ev.target)
  }

  const checkRegex = RegExp("[^a-zA-Z,]", "g")
  if (checkRegex.test(ev.key)) {
    ev.preventDefault()
  }
}

function handleTags(ev) {
  var dropdown = ev.target.parentElement.querySelector(".dropdown-profile") 

  if (dropdown == null) {
    dropdown = addDropdown(ev.target)
  }

  manageDropdown(dropdown, ev.target.value)
}

function removeDropdown(ev) {
  const dropdown = ev.target.parentElement.querySelector(".dropdown-profile") 
  dropdown.remove()
}

function EditProfile(props) {
    const [user, setUser] = useState(null)

    useEffect(() => {
      getUser(setUser)
    }, [])

    if (user == "N" || user == null) {return (<></>)}

    return (
       <form className="form-info" onSubmit={(e) => e.preventDefault()}>
        <div className="form-item" style={{marginTop: "35px"}}>
          <div>
            <img src="../corn.jpg" className="profile-pic"></img>
          </div>
          
          <div>
            <h1 style={{fontSize: "22px", marginBottom: "0px"}}>Dick</h1>
            <button className="profile-pic-button">Change profile photo</button>
            <div className="info-text" style={{fontWeight: "600", marginTop: "20px"}}>Public Information</div>
            <div className="info-text">This information will be part of your public profile</div>
          </div>
        </div>
        <div className="form-item" style={{marginTop: "15px"}}>
          <div>
            <label>Bio</label>
          </div>
          <textarea>{user.bio}</textarea>
        </div>
        <div className="form-item">
          <div>
            <label>Cuisine Prefrences</label>
          </div>
          <div style={{position: "relative"}}>
            {/* <textarea 
            style={{width: "100%", padding: "0px", verticalAlign: "top"}} 
            placeholder="Enter tags in comma seperated list eg. Indian, Thai, Mongolian"
            onChange={(e) => handleTags(e)}
            onBlur={(e) => removeDropdown(e)}
            onFocus={(e) => handleTags(e)}
            onKeyDown={(e) => {
              manageKeys(e)
              if (e.keyCode == 13) {
                e.preventDefault()
              }
            }}
            >
            </textarea> */}
            <TagEdit type={user.cuisinePreferences}  />
            <div className="info-text a-drop">Cuisine Prefrences tells other users what types of food you like</div>
          </div>
        </div>
        <div className="form-item">
          <div>
            <label>Cuisine Specialties</label>
          </div>
          <div style={{position: "relative"}}>
            <TagEdit type={user.cuisineSpecialities} />
            <div className="info-text" style={{marginTop: "4px"}}>Cuisine Specialties tells other users what types of food you like to make!</div>
            <button className="submitBtn" style={{marginTop: "20px"}}>Submit</button>
            {/* <div className="info-text" style={{fontWeight: "600", marginTop: "30px"}}>Personal Information</div> */}
            {/* <div className="info-text">This information will not be part of your public profile</div> */}
          </div>
        </div>
        {/* <div className="form-item" style={{marginTop: "15px"}}>
          <div>
            <label>Address</label>
          </div>
          <input></input>
        </div> */}
        {/* <div className="form-item" style={{marginBottom: "20px"}}>
          <div>
            <label>Email</label>
          </div>
          <div>
            <input style={{width: "100%"}}></input>
            <button className="submitBtn" style={{marginTop: "20px"}}>Submit</button>
          </div>
          
        </div> */}
      </form>
    )
}

export default EditProfile;