import {React, useState, useEffect} from 'react';
import "./styles/TagEdit.css"
import { getUser } from '../pages/fetchFunctions';

const FoodItems = [
    "Indian",
    "Chinese",
    "Thai",
    "Mexican",
    "Indi",
    "Indonesian"
]

// function updateDropdown(dropdown, query) 
// updates the drop down passed based off the query


function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
}

function getQueryList(queryValue, curPrefrences) {
    if (curPrefrences.length == 6) return ([])

    const queryRegex = RegExp(queryValue, "g")
    const filterList = FoodItems.filter((cuisineType) => queryRegex.test(cuisineType) && !(curPrefrences.includes(cuisineType)))
    return filterList
}

function updateDropdown(query, dropdown, prefrences) {
    removeAllChildNodes(dropdown)
    const FoodItems = getQueryList(query, prefrences)
    
    if (FoodItems.length == 0) {return}
    
    FoodItems.map((FoodItem) => {
      const FoodElement = document.createElement("span")

      FoodElement.textContent = FoodItem
      dropdown.appendChild(FoodElement)
    })

    dropdown.firstChild.classList.add("dropdown-hl")
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function createDropdown(sibling) {
    const dropdown = document.createElement("div")
    dropdown.classList.add("dropdown-tag")
    insertAfter(dropdown, sibling)
    return dropdown
  }
  
function deleteDropdown(dropdown) {
    dropdown.remove()
}

// function createDropdown(sibling) 
// creates a dropdown menu right under sibling
// Highlights the first element when created

// function deleteDropdown(dropdown)
// deletes the current dropdown

// shiftDropdownDown()
// shifts the dropdown one down from what the user is selecting

// shiftDropdownUp()
// shifts the dropdown one up from what the user is selecting

// onEnter(prefrences, updatePrefrences)
// updates prefrences with the old prefrences + the new one from the hl tag which is a class

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

function onEnter(prefrences, updatePrefrences, newPrefrence) {
    const newPrefrences = [...prefrences.prefrences, newPrefrence]
    updatePrefrences({prefrences: newPrefrences})
    document.querySelector(".dropdown-tag").firstChild.classList.add("dropdown-hl")
    // const dropdown = document.querySelector(".dropdown-tag")
    // updateDropdown("", dropdown, newPrefrences)
} 

function resetDropdown() {
    const dropdown = document.querySelector(".dropdown-tag")

    if (!dropdown.firstChild) {return}

    dropdown.firstChild.classList.add("dropdown-hl")
}

//Whenever user types function
function manageKeys(ev, prefrences, updatePrefrences, updateQuery) {
    if (ev.keyCode == 40) {
      shiftDropdownDown(document.querySelector(".dropdown-tag"))
    }
    else if (ev.keyCode == 38) {
      shiftDropdownUp(document.querySelector(".dropdown-tag"))
    }
    else if (ev.keyCode == 13) {
      const hl = document.querySelector(".dropdown-hl")

      if (!hl) {return}

      onEnter(prefrences, updatePrefrences, hl.textContent)
      ev.target.value = ""
      updateQuery("")
    }
  
    const checkRegex = RegExp("[^a-zA-Z]", "g")
    if (checkRegex.test(ev.key)) {
      ev.preventDefault()
    }
  }

//represents the "Add title" pill
// When user clicks they can then start typing
// Whenever the user types something block anything that is not alphabetic characters or enter
// whenever user types call managekeys(ev)
// update query list if its not an up key, down key, enter key
// add dropdown when user clicks
// delete dropdown when user unfocuses
//user tag for when the user types something in
function PrefrenceTag(props) {
    return (
        <div className="prefrence-tag" >
            {props.prefrence}
            <button className="delete-btn" onClick={(e) => {
                props.updatePrefrences({prefrences: props.prefrences.filter((curPrefrence) => {
                   return props.prefrence != curPrefrence
                })})
            }}>X</button>
        </div>
    )
}

function AddTag(props) {
    return (
        <input 
        id="add-tag"
        onKeyDown={(e) => {
            manageKeys(e, props.prefrences, props.updatePrefrences, props.updateQuery)
        }}
        onFocus={(e) => {
            //const dropdown = createDropdown(document.querySelector(".prefrence-container"))
            //updateDropdown(e.target.value, dropdown, props.prefrences.prefrences)
            props.updateVisibility(true)
            props.updateQuery(e.target.value)
        }}
        onBlur={(e) => {
            //deleteDropdown(document.querySelector(".dropdown-tag"))
            props.updateVisibility(false)
        }}
        onChange={(e) => {
            //updateDropdown(e.target.value, document.querySelector(".dropdown-tag"), props.prefrences.prefrences)
            props.updateQuery(e.target.value)
            resetDropdown()
        }}
        autoComplete="off"
        ></input>
    )
}

function DropdownItem(props) {
    return (
        <span id={"dropdown-item".concat(props.index)} className={(props.index == 0) ? "dropdown-hl" : {}} 
        onMouseEnter={(e) => {
                const dropdownitem = document.getElementById("dropdown-item".concat(props.index))
                const curHighlight = document.querySelector(".dropdown-hl")

                if (dropdownitem == curHighlight) {return}

                if (dropdownitem && curHighlight) {
                    dropdownitem.classList.add("dropdown-hl")
                    curHighlight.classList.remove("dropdown-hl")
                }
            }
        }
        onMouseDown={function(e) {
                console.log("in there")
                onEnter(props.prefrences, props.updatePrefrences, document.querySelector(".dropdown-hl").textContent)
            }
        }
        tabIndex="0"
        >{props.prefrence}</span>
    )
}

function Dropdown(props) {
    return (<>
        {props.visible ? 
        <div className="dropdown-tag">
            {props.queryList.map((prefrence, index) =>
                <DropdownItem prefrence={prefrence} prefrences={props.prefrences} updatePrefrences={props.updatePrefrences} index={index} key={index} />
            )}
        </div>
        : <></>}
    </>)
}

function TagEdit(props) {
    // const [prefrences, updatePrefrences] = useState({prefrences: []})
    const [dropdownVisible, updateVisibility] = useState(false)
    const [query, updateQuery] = useState("")

    useEffect(() => {
        props.setPrefrences({prefrences: [...props.type]})
    }, [])

    const prefrences = props.prefrences
    const updatePrefrences = props.setPrefrences

    return (
        <>
            <div className="prefrence-container">{
            prefrences.prefrences.map((prefrence, index) => 
                <PrefrenceTag key={index} prefrence={prefrence} prefrences={prefrences.prefrences} updatePrefrences={updatePrefrences}/>
            )}
            <AddTag prefrences={prefrences} updatePrefrences={updatePrefrences} updateQuery={updateQuery} updateVisibility={updateVisibility}/>
            </div>
            <Dropdown visible={dropdownVisible} prefrences={prefrences} updatePrefrences={updatePrefrences} queryList={getQueryList(query, prefrences.prefrences)}/>
        </>
    )    

}

export default TagEdit