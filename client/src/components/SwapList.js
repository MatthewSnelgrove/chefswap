import React from "react";
import SwapListing from "./SwapListing";
import "./styles/SwapListBlueprint.css"

function SwapList(props) {
  return (
    <div className="container">
      <div className="swap-type-container">
        <div>
          <h2>{props.type}</h2>
        </div>
      </div>

    
      <div className="list-container">
        {props.data.map((person, index) => (
          //console.log(person.id)
          <SwapListing
            key={index}
            cuisineSpecialities={person.cuisineSpecialities}
            distance={person.distance}
            date={person.date}
            username={person.username}
            pfpLink={person.img}
            rating={person.rating}
            finalColJsx = {props.finalColJsx}
          />
         ))}
        <span className="no-type-text">{props.data.length == 0 ? `No users of type ${props.type.toLowerCase()}`: ""}</span>
      </div>
    </div>
  );
}

export default SwapList;
