import React from "react";
import "./styles/EditListLink.css"

function EditListLink(props) {
    const curSelected = props.curSelected
    const listType = props.listType

    return (
        <li id={curSelected == listType ? "style-selected": {}}>
            <a className="full-a" onClick={(e) => {
                if (curSelected == listType) {return}
                window.location = props.link
            }}/>
            <div style={curSelected == listType ? {fontWeight: "600"}: {}}>
            {props.display}
            </div>
        </li>
    )
}

export default EditListLink;