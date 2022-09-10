import React from 'react'
import "./SwapListing.css"
import Tag from './Tag'




function SwapListing(props) {
    return (
    <div>
        <div className="main-container">
            <div className="info-container">
                <div className="image-container">
                    <img src="../profile.png" style={{ height: 55, width: 55, borderRadius: 30 }}/>
                </div>
                <div className="user-tag">
                    <div className="username">{props.username}</div>
                </div>
                
                <div className="distance-tag">
                    <img style={{ height: 33, width: 33}} src="../location.png"></img>
                    <span>{props.distance}</span>
                </div>
                <div className="rating-tag">
                    <img style={{ height: 33, width: 33}} src="../star.png"></img>
                    <div >{props.rating}</div>
                </div>
            </div>
            <div className="tags">{
                Object.keys(props.cuisineSpecialties).map((cuisine, index) => 
                    <Tag key={index} cuisine={cuisine} />
            )}</div>   
            <button className="bg-info">Swap Request</button>
        </div>
    </div>
    )
}





export default SwapListing