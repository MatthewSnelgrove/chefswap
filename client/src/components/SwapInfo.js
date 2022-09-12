import React from 'react';
import "./styles/SwapInfo.scss";

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
      <div className="main-container-i">
        <div className="user-info-i" >
          <img src={props.img} style={{ height: 55, width: 55, borderRadius: 30 }} />
          <span className="flow-tag-i">{props.username}</span>
        </div>

        <div className="date-tag-i">{props.date}</div>
        <div className="distance-tag-i">{props.distance} from you</div>

        <button className="bg-info-i">Message</button>
      </div>
    </div>
  )
}

export default SwapInfo