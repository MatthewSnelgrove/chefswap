import React from "react";
import "./styles/SwapListing.css";
import Tag from "./Tag";

/**
 * Models a single swap result listed in /find-swap
 * @param {object} props Contains username, distance, rating, cuisineSpecialties (obj?)
 */
function SwapListing(props) {
  return (
    <div>
      <div className="main-container">
        <div className="info-container">
          <div className="image-container">
            <img
              alt="User profile"
              src="../profile.png"
              style={{ height: 55, width: 55, borderRadius: 30 }}
            />
          </div>
          <div className="user-tag">
            {/* <div className="username">X-09sk</div> */}
            <div className="username">{props.username}</div>
          </div>

          <div className="distance-tag">
            <img
              alt="location icon"
              style={{ height: 33, width: 33 }}
              src="../location.png"
            ></img>
            <span className="distance-display">{props.distance}km</span>
          </div>
          <div className="rating-tag">
            <img
              alt="star icon"
              style={{ height: 33, width: 33 }}
              src="../star.png"
            ></img>
            <div>{props.rating}</div>
          </div>
        </div>
        <div className="tags">
          {props.cuisineSpecialities.map((cuisine, index) => (
            <Tag key={index} cuisine={cuisine} />
          ))}
        </div>
        <div className="finalCol-container">
          {props.finalColJsx}
        </div>
      </div>
    </div>
  );
}

export default SwapListing;
