import React from 'react';
import "./SwapInfo.scss";

/*
format of prop data
data {
    date: date string
    address: address string
    img: source to picture
}
*/
function SwapInfo(props) {
  return (
    <div>
        <div className="main-container">
            <div className="user-info" >
              <img src={props.img} style={{ height: 55, width: 55, borderRadius: 30 }}/>
              <span className="flow-tag">{props.username}</span>
            </div>
            
            <span className="date-tag">{props.date}</span>
            <span className="distance-tag">{props.distance} from you</span>
            
            <button className="bg-info">Message</button>
        </div>
    </div>
  )
}

export default SwapInfo