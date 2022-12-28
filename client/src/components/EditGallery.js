import { React, useEffect, useState } from "react";
import "./styles/EditGallery.css";
import { addNewPhoto, deletePhoto } from "../utils/changeFunctions"
import { useUser } from "./useUser";

const imgLength = "300px"

function EditGallery() {
  const [images, setImages] = useState([])
  const [deleteImg, setDeleteImg] = useState(null)
  const user = useUser()
  const globalVars = global.config
  const loading = globalVars.userStates.loading
  const GalleryLink = globalVars.pages.editGallery

  useEffect(() => {
    if (user == loading) { return }
    setImages([...user.images])
  }, [user])

  if (user == loading) return (<></>)

  return (
    <div className="gallery-container">
      <div className="header">
        <span className="gallery-text">Gallery</span>
        <form id="image-form">
          <label className="base-btn add-photo-text" onSubmit={(e) => { e.preventDefault() }}>
            Upload new Photo
            <input type="file" id="file" accept="image/png, image/jpeg" onChange={(e) => {
              if (e.target.value == "") { return }
              const formData = new FormData
              formData.append("image", e.target.files[0])
              addNewPhoto(user.accountUid, formData, GalleryLink)
            }} style={{ display: "none" }} />
          </label>
        </form>
      </div>
      <div className="profile-img-container"> {images.map((imgJSON, index) =>
        <GalleryImg key={index} imgJSON={imgJSON} images={images} setDeleteImg={setDeleteImg} setImages={setImages} />
      )}
      </div>
      <ConfirmModal setImages={setImages} deleteImg={deleteImg}/>
    </div>

  )
}

function GalleryImg(props) {
  return (
    <div className="gallery-img-dim gallery-img-container">
      <img src={props.imgJSON.imageLink} className="gallery-img"></img>
      <button className="delete-button" data-bs-toggle="modal" type="button" data-bs-target="#ConfirmModal"
        onClick={(e) => {
          props.setDeleteImg({ accountUid: props.imgJSON.accountUid, imageUid: props.imgJSON.imageUid })
        }}
        >
        <span style={{fontSize: "30px", marginTop: "5px"}} class="material-symbols-outlined">delete</span>
        {/* <i className="material-icons" style={{fontSize: "30px", color: "white", marginTop: "5px"}}>delete</i> */}
      </button>
    </div>
  )
}

function ConfirmModal(props) {
  return (
    <div class="portfolio-modal modal fade" id="ConfirmModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Confirm Delete Image</h5>
            <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">Are you sure you want to delete this image?</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onClick={(e) => deleteImg(props.setImages, props.deleteImg)}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  )
}


function deleteImg(setImages, deleteImg) {
  deletePhoto(deleteImg.accountUid, deleteImg.imageUid)
  setImages((curImages) => curImages.filter((curImage) => {
    return curImage.imageUid != deleteImg.imageUid
  }))
}

// async function getNewImages(images, setImages) {

//     const pickerOpts = {
//         types: [
//             {
//                 description: "Images",
//                 accept: {
//                     "image/*": [".png", ".jpeg", ".jpg"]
//                 }
//             }
//         ],
//         multiple: true
//     }

//     var Handles = await window.showOpenFilePicker(pickerOpts)
//     var newImages = Handles.map(async (Handle) => {
//         const file = await Handle.getFile()
//         const url = URL.createObjectURL(file)
//         return url
//     })

//     Promise.all(newImages).then((values) => {
//         if (images == null) {
//             setImages({images: [...values]})
//             return
//         }

//         setImages({images: [...images.images, ...values]})
//     })

//     // if (images == null) {
//     //     return {images: [...newImages]}
//     // }

//     // console.log(newImages)

//     // return {images: [...images.images, ...newImages]}

//     //addPhotoToSession(file.name)
//     //updateImages(images, setImages, file.name)
// }

// function connectDraggables() {
//     const draggables = document.querySelectorAll(".draggable")
//     const container = document.querySelector(".profile-img-container")

//     draggables.forEach(draggable => {
//         draggable.addEventListener("dragstart", () => {
//             draggable.classList.add("dragging")
//         })

//         draggable.addEventListener("dragend", () => {
//             draggable.classList.remove("dragging")
//         })
//     })

//     container.addEventListener('dragover', (e) => {
//         e.preventDefault()
//         const afterElement = getDragAfterElement(container, e.clientY, e.clientX)

//         const draggable = document.querySelector(".dragging")

//         if (afterElement == null) {
//             container.appendChild(draggable)
//         } else {
//             container.insertBefore(draggable, afterElement)
//         }

//     })

//     function getDragAfterElement(container, y, x) {
//         const draggableElements = [...container.querySelectorAll(".draggable:not(.dragging)")]

//         return draggableElements.reduce((closest, child) => {
//             const box = child.getBoundingClientRect()
//             const offset = y - box.top - (box.height /2)
//             const offset2 = x - box.left - (box.width/2)

//             console.log(offset2)

//             if ((offset < 0 && offset > closest.offset || offset2 < 0 && offset2 > closest.offset2)) {
//                 return { offset: offset, element: child, offset2: offset2}
//             } else {
//                 return closest
//             }
//         }, {offset: Number.NEGATIVE_INFINITY}).element
//     }

// }

export default EditGallery;
