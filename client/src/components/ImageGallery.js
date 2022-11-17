import React from "react";
import "./styles/ImageGallery.css";

function ImageGallery(props) {

    if (props.images.length == 1) {
        return (
            <div>
                <img style={props.imgStyle} src={props.images[0].imageLink} class="d-block w-100" />
            </div>
        )
    }

    return (
        <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-indicators">
                {props.images.map((image, index) => 
                    <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to={index} class={props.index == 0 ? "": "active"}></button>
                )}
            </div>
            <div class="carousel-inner" >
                {props.images.map((image, index) => 
                    <CarouselItem key={index} index={index} imgStyle={props.imgStyle} imageLink={image.imageLink} />
                )}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>
    )
}

function CarouselItem(props) {
    return (
        <div class={props.index == 0 ? "carousel-item": "carousel-item active"} >
            <img style={props.imgStyle} src={props.imageLink} class="d-block w-100" />
        </div>
    )
}

export default ImageGallery;