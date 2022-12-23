import React from "react";
import SwapListing from "./SwapListing";
import "./styles/SwapList.css";

//type: tpy

function SwapList(props) {
  return (
    <div className="container">
      <div className="swap-type-container">
        <div>
          <h2>{props.type}</h2>
        </div>
      </div>

    
      <div className="list-container">
        {props.data.map((person) => (
          //console.log(person.id)
          <SwapListing
            key={person.id}
            cuisineSpecialities={person.cuisineSpecialities}
            distance={person.distance}
            date={person.date}
            username={person.username}
            img={person.img}
            rating={person.rating}
            finalColJsx = {props.finalColJsx}
          />
        ))}
      </div>
    </div>
  );
}

export default SwapList;
