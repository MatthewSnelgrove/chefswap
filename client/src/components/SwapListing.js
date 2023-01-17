import React from "react";
import "./styles/SwapListing.css";
import Tag from "./Tag";
import ProfilePicture from "./ProfilePicture";

/**
 * Models a single swap result listed in /find-swap
 * @param {object} props Contains username, distance, rating, cuisineSpecialties (obj?)
 */
function SwapListing(props) {
  if (props.innerRef) {
    props.innerRefData.current = {
      rating: props.rating,
      accountUid: props.accountUid,
      distance: props.distance,
      similarity: props.similarity
    }
  }
  return (
    <div ref={props.innerRef}>
      <div className="main-container">
        <div className="info-container">
          <div className="image-container">
            <ProfilePicture style={{height: 55, width: 55, borderRadius: 30}} pfpLink={props.pfpLink} />
          </div>
          <div className="user-tag">
            <div className="username">{props.username}</div>
          </div>

          <div className="distance-tag">
            <span style={{ fontSize: "33px" }} class="material-symbols-outlined">location_on</span>
            <span className="distance-display">{props.distance.toFixed(1)}km</span>
          </div>
          <div className="rating-tag">
            <div class="star-ratings-sprite">
              <span style={props.rating ? {width: `${props.rating * 20}%`}: {width: "0%"}} class="star-ratings-sprite-rating"></span>
            </div>
            <span style={{marginLeft: "4px"}}>({props.numRatings})</span>
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
