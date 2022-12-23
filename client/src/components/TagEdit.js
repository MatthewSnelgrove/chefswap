import { useState, useEffect } from 'react';
import React from 'react';
import "./styles/TagEdit.css"
import 'react-toastify/dist/ReactToastify.css';
import "./styles/Tag.css"

function getQueryList(queryValue, typeList) {
  if (typeList.length == global.config.maxLengths.maxQueryLength) return ([])

  const queryRegex = RegExp(queryValue, "g")
  const filterList = global.config.cuisineItems.filter((singleType) => queryRegex.test(singleType) && !(typeList.includes(singleType)))

  return filterList
}

// shiftDropdownDown()
// shifts the dropdown one down from what the user is selecting

// shiftDropdownUp()
// shifts the dropdown one up from what the user is selecting

// onEnter(prefrences, updateTypeList)
// updates prefrences with the old prefrences + the new one from the hl tag which is a class

function shiftDropdownDown(dropdown) {
  if (dropdown.childElementCount <= 1) {
    return;
  }

  const hlElement = dropdown.querySelector(".dropdown-hl");
  const nextElement = hlElement.nextElementSibling;

  if (nextElement == null) {
    return;
  }

  hlElement.classList.remove("dropdown-hl");
  nextElement.classList.add("dropdown-hl");
}

function shiftDropdownUp(dropdown) {
  if (dropdown.childElementCount <= 1) {
    return;
  }

  const hlElement = dropdown.querySelector(".dropdown-hl");
  const previousElement = hlElement.previousElementSibling;

  if (previousElement == null) {
    return;
  }

  hlElement.classList.remove("dropdown-hl");
  previousElement.classList.add("dropdown-hl");
}

function onEnter(updateTypeList, newType, Uid, addFunc) {
  updateTypeList((prevTypeList) => [...prevTypeList, newType])
  addFunc(Uid, newType)
  document.querySelector(".dropdown-tag").firstChild.classList.add("dropdown-hl")
}

function resetDropdown() {
  const dropdown = document.querySelector(".dropdown-tag");

  if (!dropdown.firstChild) {
    return;
  }

  dropdown.firstChild.classList.add("dropdown-hl");
}

//Whenever user types function
function manageKeys(ev, updateType, updateQuery, Uid, addFunc) {
  if (ev.keyCode == 40) {
    shiftDropdownDown(document.querySelector(".dropdown-tag"))
  }
  else if (ev.keyCode == 38) {
    shiftDropdownUp(document.querySelector(".dropdown-tag"))
  }
  else if (ev.keyCode == 13) {
    const hl = document.querySelector(".dropdown-hl")

    if (!hl) {return}

    onEnter(updateType, hl.textContent, Uid, addFunc)
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
function TypeTag(props) {
  return (
    <div className="tag" >
      {props.singleType}
      <button className="delete-btn" onClick={(e) => {
        props.updateTypeList((prevTypeList) => prevTypeList.filter((curType) => {
          return props.singleType != curType
        }))
        props.deleteFunc(props.Uid, props.singleType)
      }}>X</button>
    </div>
  )
}

function AddTag(props) {
  return (
    <input style={{textAlign: "center"}}
      id="add-tag"
      onKeyDown={(e) => {
        manageKeys(e, props.updateTypeList, props.updateQuery, props.Uid, props.addFunc)
      }}
      onFocus={(e) => {
        props.updateVisibility(true)
        props.updateQuery(e.target.value)
      }}
      onBlur={(e) => {
        props.updateVisibility(false)
      }}
      onChange={(e) => {
        props.updateQuery(e.target.value)
        resetDropdown()
      }}
      autoComplete="off"
      placeholder={props.placeholder}
    ></input>
  )
}

function DropdownItem(props) {
  return (
    <span
      id={"dropdown-item".concat(props.index)}
      className={props.index == 0 ? "dropdown-hl" : {}}
      onMouseEnter={(e) => {
        const dropdownitem = document.getElementById("dropdown-item".concat(props.index))
        const curHighlight = document.querySelector(".dropdown-hl")

        if (dropdownitem == curHighlight) {return}

        if (dropdownitem && curHighlight) {
            dropdownitem.classList.add("dropdown-hl")
            curHighlight.classList.remove("dropdown-hl")
        }
      }}
      onMouseDown = {function(e) {
          onEnter(props.updateTypeList, document.querySelector(".dropdown-hl").textContent, props.Uid, props.addFunc)
        }
      }

    >{props.singleType}</span >
   )
}


function Dropdown(props) {
    return (
      <>
        {props.visible ? (
          <div className="dropdown-tag">
            {props.queryList.map((singleType, index) =>
              <DropdownItem singleType={singleType} updateTypeList={props.updateTypeList} index={index} key={index} Uid={props.Uid} addFunc={props.addFunc} />
            )}
          </div>
        ) : (
          <></>
        )}
      </>
    );
  }

  function TagEdit(props) {
    const [dropdownVisible, updateVisibility] = useState(false)
    const [query, updateQuery] = useState("")
    const [typeList, updateTypeList] = useState([])

    useEffect(() => {
      updateTypeList([...props.fillInList])
    }, [])

    return (
      <>
        <div className="type-container">{
          typeList.map((singleType, index) =>
            <TypeTag key={index} singleType={singleType} updateTypeList={updateTypeList} Uid={props.Uid} deleteFunc={props.deleteFunc} />
          )}
          <AddTag updateTypeList={updateTypeList} updateQuery={updateQuery} updateVisibility={updateVisibility} Uid={props.Uid} addFunc={props.addFunc} placeholder={props.addPlaceholder} />
        </div>
        <Dropdown visible={dropdownVisible} updateTypeList={updateTypeList} queryList={getQueryList(query, typeList)} Uid={props.Uid} addFunc={props.addFunc} />
      </>
    )

  }

  export default TagEdit;
