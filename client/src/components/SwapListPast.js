import React from "react";
import SwapListBlueprint from "./SwapListBlueprint";
import SwapListing from "./SwapListing";
import "../pages/styles/MySwapsPage.css"
import { useSwapType } from "./useSwapType";

function SwapListPast(props) {
    return (
        <SwapListBlueprint type={"Past"} data={props.swapListPast}>
        {props.swapListPast.map((person, index) => (
          //console.log(person.id)
            <SwapListing
            key={index}
            cuisineSpecialities={person.cuisineSpecialities}
            distance={person.distance}
            date={person.date}
            username={person.username}
            pfpLink={person.img}
            rating={person.rating}
            finalColJsx = {<></>}
            />
         ))}
        </SwapListBlueprint>
    )
}


export default SwapListPast;