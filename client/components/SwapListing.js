import React from "react";
import styles from "./styles/SwapListing.module.css";
import Tag from "./Tag";
import ProfilePicture from "./ProfilePicture";
import Link from "next/link";

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
      similarity: props.similarity,
    };
  }
  return (
    <div ref={props.innerRef}>
      <div className={styles.main_container}>
        <div className={styles.info_container}>
          <div className={styles.image_container}>
            <Link href={`/u/${props.username}`}>
              <ProfilePicture
                style={{ height: 55, width: 55, borderRadius: 30 }}
                pfpLink={props.pfpLink}
              />
            </Link>
          </div>
          <div className={styles.user_tag}>
            <Link
              href={`/u/${props.username}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <div className={styles.username}>{props.username}</div>
            </Link>
          </div>

          <div className={styles.distance_tag}>
            <span
              style={{ fontSize: "33px" }}
              class="material-symbols-outlined"
            >
              location_on
            </span>
            <span className={styles.distance_display}>
              {props.distance.toFixed(1)}km
            </span>
          </div>
          <div className={styles.rating_tag}>
            <div class={styles.star_ratings_sprite}>
              <span
                style={
                  props.rating
                    ? { width: `${props.rating * 20}%` }
                    : { width: "0%" }
                }
                class={styles.star_ratings_sprite_rating}
              ></span>
            </div>
            <span style={{ marginLeft: "4px" }}>({props.numRatings})</span>
          </div>
        </div>
        <div className={styles.tags}>
          {props.cuisineSpecialities.map((cuisine, index) => (
            <Tag key={index} cuisine={cuisine} />
          ))}
        </div>
        <div className={styles.finalCol_container}>{props.finalColJsx}</div>
      </div>
    </div>
  );
}

export default SwapListing;
