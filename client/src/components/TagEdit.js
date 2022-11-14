import { useState, useEffect } from "react";
import React from "react";
import "./styles/TagEdit.css";

const maxQueryLength = 5;

const FoodItems = ["Indian", "Italian", "Greek", "Pizza", "Thai"];

function getQueryList(queryValue, curPrefrences) {
  if (curPrefrences.length == maxQueryLength) return [];

  const queryRegex = RegExp(queryValue, "g");
  const filterList = FoodItems.filter(
    (cuisineType) =>
      queryRegex.test(cuisineType) && !curPrefrences.includes(cuisineType)
  );

  return filterList;
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

function onEnter(prefrences, updatePrefrences, newPreference, Uid, addFunc) {
  const newPreferences = [...prefrences.prefrences, newPreference];
  updatePrefrences({ prefrences: newPreferences });
  addFunc(Uid, newPreference);
  document
    .querySelector(".dropdown-tag")
    .firstChild.classList.add("dropdown-hl");
}

function resetDropdown() {
  const dropdown = document.querySelector(".dropdown-tag");

  if (!dropdown.firstChild) {
    return;
  }

  dropdown.firstChild.classList.add("dropdown-hl");
}

//Whenever user types function
function manageKeys(
  ev,
  prefrences,
  updatePrefrences,
  updateQuery,
  Uid,
  addFunc
) {
  if (ev.keyCode == 40) {
    shiftDropdownDown(document.querySelector(".dropdown-tag"));
  } else if (ev.keyCode == 38) {
    shiftDropdownUp(document.querySelector(".dropdown-tag"));
  } else if (ev.keyCode == 13) {
    const hl = document.querySelector(".dropdown-hl");

    if (!hl) {
      return;
    }

    onEnter(prefrences, updatePrefrences, hl.textContent, Uid, addFunc);
    ev.target.value = "";
    updateQuery("");
  }

  const checkRegex = RegExp("[^a-zA-Z]", "g");
  if (checkRegex.test(ev.key)) {
    ev.preventDefault();
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
    <div className="prefrence-tag">
      {props.prefrence}
      <button
        className="delete-btn"
        onClick={(e) => {
          props.updatePrefrences({
            prefrences: props.prefrences.filter((curPrefrence) => {
              return props.prefrence != curPrefrence;
            }),
          });
          props.deleteFunc(props.Uid, props.prefrence);
        }}
      >
        X
      </button>
    </div>
  );
}

function AddTag(props) {
  return (
    <input
      id="add-tag"
      onKeyDown={(e) => {
        manageKeys(
          e,
          props.prefrences,
          props.updatePrefrences,
          props.updateQuery,
          props.Uid,
          props.addFunc
        );
      }}
      onFocus={(e) => {
        props.updateVisibility(true);
        props.updateQuery(e.target.value);
      }}
      onBlur={(e) => {
        props.updateVisibility(false);
      }}
      onChange={(e) => {
        props.updateQuery(e.target.value);
        resetDropdown();
      }}
      autoComplete="off"
    ></input>
  );
}

function DropdownItem(props) {
  return (
    <span
      id={"dropdown-item".concat(props.index)}
      className={props.index == 0 ? "dropdown-hl" : {}}
      onMouseEnter={(e) => {
        const dropdownitem = document.getElementById(
          "dropdown-item".concat(props.index)
        );
        const curHighlight = document.querySelector(".dropdown-hl");

        if (dropdownitem == curHighlight) {
          return;
        }

        if (dropdownitem && curHighlight) {
          dropdownitem.classList.add("dropdown-hl");
          curHighlight.classList.remove("dropdown-hl");
        }
      }}
      onMouseDown={function (e) {
        onEnter(
          props.prefrences,
          props.updatePrefrences,
          document.querySelector(".dropdown-hl").textContent,
          props.Uid,
          props.addFunc
        );
      }}
      tabIndex="0"
    >
      {props.prefrence}
    </span>
  );
}

function Dropdown(props) {
  return (
    <>
      {props.visible ? (
        <div className="dropdown-tag">
          {props.queryList.map((prefrence, index) => (
            <DropdownItem
              prefrence={prefrence}
              prefrences={props.prefrences}
              updatePrefrences={props.updatePrefrences}
              index={index}
              key={index}
              Uid={props.Uid}
              addFunc={props.addFunc}
            />
          ))}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

function TagEdit(props) {
  const [dropdownVisible, updateVisibility] = useState(false);
  const [query, updateQuery] = useState("");

  useEffect(() => {
    props.setPrefrences({ prefrences: [...props.type] });
  }, []);

  const prefrences = props.prefrences;
  const updatePrefrences = props.setPrefrences;

  return (
    <>
      <div className="prefrence-container">
        {prefrences.prefrences.map((prefrence, index) => (
          <PrefrenceTag
            key={index}
            prefrence={prefrence}
            prefrences={prefrences.prefrences}
            updatePrefrences={updatePrefrences}
            Uid={props.Uid}
            deleteFunc={props.deleteFunc}
          />
        ))}
      </div>
      <Dropdown
        visible={dropdownVisible}
        prefrences={prefrences}
        updatePrefrences={updatePrefrences}
        queryList={getQueryList(query, prefrences.prefrences)}
        Uid={props.Uid}
        addFunc={props.addFunc}
      />
      <AddTag
        prefrences={prefrences}
        updatePrefrences={updatePrefrences}
        updateQuery={updateQuery}
        updateVisibility={updateVisibility}
        Uid={props.Uid}
        addFunc={props.addFunc}
      />
    </>
  );
}

export default TagEdit;
