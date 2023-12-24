import React from "react";
import SwapListing from "./SwapListing";
import styles from "./styles/SwapListBlueprint.module.css";

function SwapList(props) {
  return (
    <div>
      <div className={styles.swap_type_container}>
        <div>
          <h2>{props.type}</h2>
        </div>
      </div>

      <div className={styles.list_container}>
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
            finalColJsx={props.finalColJsx}
          />
        ))}
        <span className={styles.no_type_text}>
          {props.data.length == 0
            ? `No users of type ${props.type.toLowerCase()}`
            : ""}
        </span>
      </div>
    </div>
  );
}

export default SwapList;
