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
          <img alt="User profile" src={props.img} style={{ height: 55, width: 55, borderRadius: 30 }} />
          <span className="flow-tag-i">{props.username}</span>
        </div>

        <div className="date-tag-i">{props.date}</div>
        <div className="distance-tag-i">{props.distance} from you</div>

        <button className="bg-info-i"><img src="chat_bubble.svg" style={{width: "50px", height: "50px"}} ></img></button>
      </div>
    </div>
  )
}

export default SwapInfo