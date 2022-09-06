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
            <span>{props.date}</span>
            <img src={props.img} style={{ height: 30, width: 30, borderRadius: 30 }}/>
            <span>{props.address}</span>
            <button className="bg-info">XD</button>
        </div>
    </div>
  )
}

export default SwapInfo