import {React, useEffect, useState} from "react";
import "./styles/EditGallery.css"

function EditGallery() {
    const [images, setImages] = useState(null)

    return (
        <div className="gallery-container">
            <div className="header">
                <span style={{fontWeight: 600, fontSize: "22px"}}>Gallery</span>
                <form>
                    <button type="button" className="addBtn" onClick={(e) => getNewImages(images, setImages)}>Add Photos</button>
                </form>
            </div>
            <div className="profile-img-container"> {images ? images.images.map((imgLink, index) => 
                <GalleryImg key={index} imgLink={imgLink} images={images} setImages={setImages} />
            ): ''}
            </div>
        </div>
        
    )
}

function GalleryImg(props) {
    return (
        <div style={{width: "130px", height: "130px", position: "relative"}}>
            <img src={props.imgLink} style={{width: "130px", height: "130px"}}></img>
            <a className="drag-button"></a>
            <button onClick={(e) => deleteImg(props.imgLink, props.images, props.setImages)} className="delete-button">
                <img src="../remove.PNG"></img>
            </button>
        </div>
    )
}

// function addPhotoToSession(imgName) {
//     if (sessionStorage.getItem(imgName) != null) {
//         alert("You already have an image under that name. Please try renaming your image")
//         return
//     }

//     sessionStorage.setItem(imgName, imgName)
// }

function deleteImg(imgLink, images, setImages) {
    var filtered = images.images.filter(function(value){
        return value != imgLink
    })

    setImages({images: [...filtered]})
}

async function getNewImages(images, setImages) {
    
    const pickerOpts = {
        types: [
            {
                description: "Images",
                accept: {
                    "image/*": [".png", ".jpeg", ".jpg"]
                }
            }
        ],
        multiple: true
    }

    var Handles = await window.showOpenFilePicker(pickerOpts)
    var newImages = Handles.map(async (Handle) => {
        const file = await Handle.getFile()
        const url = URL.createObjectURL(file)
        return url
    })

    Promise.all(newImages).then((values) => {
        if (images == null) {
            setImages({images: [...values]})
            return
        }

        setImages({images: [...images.images, ...values]})
    })


    // if (images == null) {
    //     return {images: [...newImages]}
    // }
    
    // console.log(newImages)

    // return {images: [...images.images, ...newImages]}

    //addPhotoToSession(file.name)
    //updateImages(images, setImages, file.name)
}

function connectDraggables() {
    const draggables = document.querySelectorAll(".draggable")
    const container = document.querySelector(".profile-img-container")

    draggables.forEach(draggable => {
        draggable.addEventListener("dragstart", () => {
            draggable.classList.add("dragging")
        })

        draggable.addEventListener("dragend", () => {
            draggable.classList.remove("dragging")
        })
    })

    container.addEventListener('dragover', (e) => {
        e.preventDefault()
        const afterElement = getDragAfterElement(container, e.clientY, e.clientX)
        
        const draggable = document.querySelector(".dragging")
        
        if (afterElement == null) {
            container.appendChild(draggable)
        } else {
            container.insertBefore(draggable, afterElement)
        }

    })

    function getDragAfterElement(container, y, x) {
        const draggableElements = [...container.querySelectorAll(".draggable:not(.dragging)")]

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect()
            const offset = y - box.top - (box.height /2)
            const offset2 = x - box.left - (box.width/2)

            console.log(offset2)

            if ((offset < 0 && offset > closest.offset || offset2 < 0 && offset2 > closest.offset2)) {
                return { offset: offset, element: child, offset2: offset2}
            } else {
                return closest
            }
        }, {offset: Number.NEGATIVE_INFINITY}).element
    }

}


export default EditGallery;