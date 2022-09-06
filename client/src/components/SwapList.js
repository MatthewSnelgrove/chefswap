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
                <SwapInfo key = {person.id} date={person.date} img={person.img} address={person.address} />
            )}
        </div>
      </div>
      
  )
}

export default SwapList