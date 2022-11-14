import { React, useEffect, useState } from "react";
import "./styles/EditGallery.css";
import { getUser } from "../pages/fetchFunctions";
import { addNewPhoto, deletePhoto } from "../pages/changeFunctions";

function EditGallery() {
  const [images, setImages] = useState(null);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    function setProperties(user) {
      // const imgLinks = user.images.map((img) => {
      //     return img.imageLink
      // })
      setUid(user.accountUid);
      setImages({ images: [...user.images] });
    }

    getUser(setProperties);
  }, []);

  if (images == null || uid == null) return <></>;

  return (
    <div className="gallery-container">
      <div className="header">
        <span style={{ fontWeight: 600, fontSize: "22px" }}>Gallery</span>
        <form id="image-form">
          <label
            className="addBtn"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            Upload new Photo
            <input
              type="file"
              id="file"
              accept="image/png, image/jpeg"
              onChange={(e) => {
                if (e.target.value == "") {
                  return;
                }
                const formData = new FormData();
                formData.append("file", e.target.files[0]);
                addNewPhoto(
                  uid,
                  formData,
                  "http://localhost:3000/accounts/gallery"
                );
              }}
              style={{ display: "none" }}
            />
          </label>
        </form>
      </div>
      <div className="profile-img-container">
        {" "}
        {images.images.map((imgJSON, index) => (
          <GalleryImg
            key={index}
            imgJSON={imgJSON}
            images={images}
            setImages={setImages}
          />
        ))}
      </div>
    </div>
  );
}

function GalleryImg(props) {
  return (
    <div style={{ width: "130px", height: "130px", position: "relative" }}>
      <img
        src={props.imgJSON.imageLink}
        style={{ width: "130px", height: "130px" }}
      ></img>
      <a className="drag-button"></a>
      <button
        onClick={(e) => deleteImg(props.imgJSON, props.images, props.setImages)}
        className="delete-button"
      >
        <img src="../remove.PNG"></img>
      </button>
    </div>
  );
}

function deleteImg(imgJSON, images, setImages) {
  deletePhoto(imgJSON.accountUid, imgJSON.imageUid);

  var filtered = images.images.filter(function (curImage) {
    return curImage.imageUid != imgJSON.imageUid;
  });

  setImages({ images: [...filtered] });
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
