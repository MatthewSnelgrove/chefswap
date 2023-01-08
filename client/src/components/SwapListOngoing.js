import { React, useState } from "react";
import SwapListBlueprint from "./SwapListBlueprint";
import SwapListing from "./SwapListing";
import "../pages/styles/MySwapsPage.css"
import { changeSwapStatus, changeAvgRating } from "../utils/changeFunctions";
import FilterByRating from "./FilterByRating";

function SwapListOngoing(props) {
  const user = props.user
  const [curPerson, setCurPerson] = useState({username: ""})

  return (
    <>
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
          numRatings={person.numRatings}
          finalColJsx = {<EndSwap person={person} setCurPerson={setCurPerson} />}
          />
        ))}
      </SwapListBlueprint>
      <ConfirmRatingModal curPerson={curPerson} user={user} setSwapListOngoing={props.setSwapListOngoing} setSwapListPast={props.setSwapListPast}  />
    </>
  )
}

function EndSwap(props) {
  const person = props.person
  
  return (
    <div className="button-wrapper">
      <button className="end-swap-button" title="End swap with user" data-bs-toggle="modal" data-bs-target="#ConfirmModal1" onClick={(e) => {
        props.setCurPerson(person)
      }}>
        <span class="material-icons-round end-swap-image">exit_to_app</span>
      </button>
    </div>
  )
}

function endSwap(user, curPerson, setSwapListOngoing, setSwapListPast) {
  changeSwapStatus(user.accountUid, curPerson.accountUid, curPerson.username, curPerson.requestTimestamp, "ended").then(() => {
    setSwapListOngoing((curSwapListOngoing) => curSwapListOngoing.filter((userFilter) => userFilter.username != curPerson.username))
    setSwapListPast((curSwapListPast) => [...curSwapListPast, curPerson])
  })
}

function ConfirmRatingModal(props) {
  const curPerson = props.curPerson
  const user = props.user

  return (
    <div class="modal fade" id="ConfirmModal1" aria-hidden="true" aria-labelledby="exampleModalToggleLabel" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalToggleLabel">Are you sure you want to cancel this swap request?</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary"  data-bs-toggle="modal"  data-bs-dismiss="modal" onClick={(e) => endSwap(user, curPerson, props.setSwapListOngoing, props.setSwapListPast)}>Confirm end swap</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SwapListOngoing;