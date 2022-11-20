import React from "react";
import SwapInfo from "./SwapInfo";
import "./styles/SwapList.css";

//type: tpy
function SwapList(props) {
  return (
    <div className="container">
      <div className="type-container">
        <div>
          <h2>{props.type}</h2>
        </div>
      </div>

      <div className="list-container">
        {props.data.map((person) => (
          //console.log(person.id)
          <SwapInfo
            key={person.id}
            cuisineSpecialties={person.cuisineSpecialties}
            distance={person.distance}
            date={person.date}
            username={person.username}
            img={person.img}
            rating={person.rating}
          />
        ))}
      </div>
    </div>
  );
}

export default SwapList;
