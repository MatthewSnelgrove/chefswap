import { check } from "prettier";
import { React, useEffect, useState } from "react";
import "./styles/EditProfile.css"
import TagEdit from "./TagEdit";
import { getUser } from '../pages/fetchFunctions';
import { changeBio } from "../pages/changeFunctions";

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

async function changeProfile() {
    const pickerOpts = {
      types: [
          {
              description: "Images",
              accept: {
                  "image/*": [".png", ".jpeg", ".jpg"]
              }
          }
      ],
      multiple: false
    }
  
  const [Handle] = await window.showOpenFilePicker(pickerOpts)
  const file = await Handle.getFile()
  const url = URL.createObjectURL(file)
  return url
}

//Remember to check empy imgFile
function handleSubmit(ev, Uid, userPrefrences, userSpecialties, bio, imgFile) {
  // console.log(Uid, userPrefrences, userSpecialties, bio, imgFile.get("file"))
  //changeBio(Uid, {bio: bio})
  const userPrefrenceJSON = {}
  
}

function EditProfile(props) {
    const [user, setUser] = useState(null)
    const [userPrefrences, setPrefrences] = useState({prefrences: []})
    const [userSpecialties, setSpecialties] = useState({prefrences: []})

    useEffect(() => {
      getUser(setUser)
    }, [])

    if (user == "N" || user == null) {return (<></>)}

    return (
       <div className="form-info">
        <div className="form-item" style={{marginTop: "35px"}}>
          <div>
            <img src={user.pfpName} id="profile-pic" className="profile-pic"></img>
          </div>
          <div>
            <h1 style={{fontSize: "22px", marginBottom: "0px"}}>{user.username}</h1>
            {/* <button className="profile-pic-button" onClick={(e) => {
              const formData = new FormData
              changeProfile()
              .then((newProfile) => {
                const profile_pic = document.getElementById("profile-pic")
                profile_pic.src = newProfile
                formData.append("file", newProfile)
              })
              .catch((reason) => console.log(reason))
              
              console.log(formData.get("file"))
            }}>Change profile photo</button> */}
            <form id="image-form">
              <label className="profile-pic-button" onSubmit={(e) => {e.preventDefault()}}>
                  Upload new Photo 
                  <input type="file" id="file" accept="image/png, image/jpeg" onChange={(e) => {
                      if (e.target.value == "") {return}
                      const profile_pic = document.getElementById("profile-pic")
                      profile_pic.src = window.URL.createObjectURL(e.target.files[0])
                  }} style={{display: "none"}} />
              </label>
            </form>
            <div className="info-text" style={{fontWeight: "600", marginTop: "20px"}}>Public Information</div>
            <div className="info-text">This information will be part of your public profile</div>
          </div>
        </div>
        <div className="form-item" style={{marginTop: "15px"}}>
          <div>
            <label>Bio</label>
          </div>
          <textarea id="bio" defaultValue={user.bio}></textarea>
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
            <TagEdit type={user.cuisinePreferences} prefrences={userPrefrences} setPrefrences={setPrefrences}  />
            <div className="info-text a-drop">Cuisine Prefrences tells other users what types of food you like</div>
          </div>
        </div>
        <div className="form-item">
          <div>
            <label>Cuisine Specialties</label>
          </div>
          <div style={{position: "relative"}}>
            <TagEdit type={user.cuisineSpecialities} prefrences={userSpecialties} setPrefrences={setSpecialties} />
            <div className="info-text" style={{marginTop: "4px"}}>Cuisine Specialties tells other users what types of food you like to make!</div>
            <button className="submitBtn" style={{marginTop: "20px"}} onClick={(e) => {
              const bio = document.getElementById("bio").value
              const formData = new FormData
              formData.append("file", document.getElementById("file").files[0])
              handleSubmit(e, user.accountUid, userPrefrences.prefrences, userSpecialties.prefrences, bio, formData)}}>
            Submit
            </button>
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
      </div>
    )
}

export default EditProfile;