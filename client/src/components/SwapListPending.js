import React from "react";
import SwapListBlueprint from "./SwapListBlueprint";
import SwapListing from "./SwapListing";
import "../pages/styles/MySwapsPage.css"
import { useSwapType } from "./useSwapType";
import { changeSwapStatus, cancelSwapRequest } from "../utils/changeFunctions";

function SwapListPending(props) {
  return (
        <SwapListBlueprint type={"Pending"} data={props.swapListPending}>
        {props.swapListPending.map((person, index) => (
          //console.log(person.id)
            <SwapListing
            key={index}
            cuisineSpecialities={person.cuisineSpecialities}
            distance={person.distance}
            date={person.date}
            username={person.username}
            pfpLink={person.img}
            rating={person.rating}
            finalColJsx = {<PendingButtons person={person} user={props.user} setSwapListPending={props.setSwapListPending} setSwapListOngoing={props.setSwapListOngoing} />}
            />
         ))}
        </SwapListBlueprint>
    )
}

function PendingButtons(props) {
  const user = props.user
  const person = props.person

  return (
    <div className="button-wrapper">
      <button className="accept-button" title="Accept swap request" onClick={(e) => 
        {
          changeSwapStatus(user.accountUid, person.accountUid, person.requestTimestamp, "ongoing")
          props.setSwapListPending((curSwapListPending) => curSwapListPending.filter((userFilter) => userFilter.username != person.username))
          props.setSwapListOngoing((curSwapListOngoing) => [...curSwapListOngoing, person])
        }}>
        <span class="material-icons-round accept-image">done</span>
      </button>
      <button className="decline-button" title="Reject swap request" onClick={(e) => 
      {
          cancelSwapRequest(user.accountUid, person.accountUid, person.requestTimestamp)
          props.setSwapListPending((curSwapListPending) => curSwapListPending.filter((userFilter) => userFilter.username != person.username))
      }}>
        <span class="material-icons-round decline-image">close</span>
      </button>
    </div>
  )
}

export default SwapListPending;