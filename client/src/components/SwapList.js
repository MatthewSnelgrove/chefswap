import React from 'react';
import SwapInfo from './SwapInfo';
import "./SwapList.css"

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
            {props.data.map((person) => 
                <SwapInfo key = {person.id} date={person.date} img={person.img} username={person.username} distance={person.distance} />
            )}
        </div>
      </div>
      
  )
}

export default SwapList