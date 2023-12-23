import React from "react";
import styles from "./styles/ImageGallery.module.css";

function ImageGallery(props) {
  // if (props.images.length == 1) {
  //     return (
  //         <div>
  //             <img style={props.imgStyle} src={props.images[0].imageLink} class="d-block w-100" />
  //         </div>
  //     )
  // }

  return (
    <div
      id="carouselExampleIndicators"
      className={`${styles.carousel_example_indicators} carousel_example_indicators carousel slide h-50`}
      data-bs-ride="carousel"
    >
      <div className={`${styles.carousel_indicators} carousel-indicators`}>
        {props.images.map((image, index) => (
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to={index}
            class={index == 0 ? "active" : ""}
          ></button>
        ))}
      </div>
      <div className={`${styles.carousel_inner} carousel-inner`}>
        {props.images.map((image, index) => (
          <CarouselItem
            key={index}
            index={index}
            imgStyle={props.imgStyle}
            imageLink={image.imageLink}
          />
        ))}
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}

function CarouselItem(props) {
  return (
    <div
      className={
        props.index == 0
          ? `${styles.carousel_item} carousel-item active`
          : `${styles.carousel_item} carousel-item`
      }
    >
      <img
        className="carouselItem d-block"
        style={props.imgStyle}
        src={props.imageLink}
      />
    </div>
  );
}

export default ImageGallery;
