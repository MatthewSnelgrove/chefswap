import React from "react";
import SwapListBlueprint from "./SwapListBlueprint";
import SwapListing from "./SwapListing";
import styles from "./styles/MySwapsPage.module.scss";
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
          numRatings={person.numRatings}
          finalColJsx={
            <PendingButtons
              person={person}
              user={props.user}
              isRequestee={props.user.accountUid != person.requesterUid}
              setSwapListPending={props.setSwapListPending}
              setSwapListOngoing={props.setSwapListOngoing}
            />
          }
        />
      ))}
    </SwapListBlueprint>
  );
}

function PendingButtons(props) {
  const user = props.user;
  const person = props.person;

  return (
    <div className={styles.button_wrapper}>
      {props.isRequestee ? (
        <button
          className={styles.accept_button}
          title="Accept swap request"
          onClick={(e) => {
            changeSwapStatus(
              user.accountUid,
              person.accountUid,
              person.username,
              person.requestTimestamp,
              "ongoing"
            ).then(() => {
              props.setSwapListPending((curSwapListPending) =>
                curSwapListPending.filter(
                  (userFilter) => userFilter.username != person.username
                )
              );
              props.setSwapListOngoing((curSwapListOngoing) => [
                ...curSwapListOngoing,
                person,
              ]);
            });
          }}
        >
          <span class="material-icons-round accept-image">done</span>
        </button>
      ) : (
        <></>
      )}
      <button
        className={styles.decline_button}
        title="Reject swap request"
        onClick={(e) => {
          cancelSwapRequest(
            user.accountUid,
            person.accountUid,
            person.username,
            person.requestTimestamp
          ).then(() => {
            props.setSwapListPending((curSwapListPending) =>
              curSwapListPending.filter(
                (userFilter) => userFilter.username != person.username
              )
            );
          });
        }}
      >
        <span class="material-icons-round decline-image">close</span>
      </button>
    </div>
  );
}

export default SwapListPending;
