import React from "react";
import SwapListBlueprint from "./SwapListBlueprint";
import SwapListing from "./SwapListing";
import "../pages/styles/MySwapsPage.css"
import { changeSwapStatus } from "../utils/changeFunctions";

function SwapListOngoing(props) {
  const user = props.user

  return (
      <SwapListBlueprint type={"Ongoing"} data={props.swapListOngoing}>
      {props.swapListOngoing.map((person, index) => (
        //console.log(person.id)
          <SwapListing
          key={index}
          cuisineSpecialities={person.cuisineSpecialities}
          distance={person.distance}
          date={person.date}
          username={person.username}
          pfpLink={person.img}
          rating={person.rating}
          finalColJsx = {<EndSwap user={user} person={person} setSwapListOngoing={props.setSwapListOngoing} setSwapListPast={props.setSwapListPast} />}
          />
        ))}
      </SwapListBlueprint>
  )
}

function EndSwap(props) {
  const user = props.user
  const person = props.person
  
  return (
    <div className="button-wrapper">
      <button className="end-swap-button" title="End swap with user" onClick={(e) => {
        changeSwapStatus(user.accountUid, person.accountUid, person.username, person.requestTimestamp, "ended").then(() => {
          props.setSwapListOngoing((curSwapListOngoing) => curSwapListOngoing.filter((userFilter) => userFilter.username != person.username))
          props.setSwapListPast((curSwapListPast) => [...curSwapListPast, person])
        })
      }}>
        <span class="material-icons-round end-swap-image">exit_to_app</span>
      </button>
    </div>
  )
}

export default SwapListOngoing;