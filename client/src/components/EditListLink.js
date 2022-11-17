import React from "react";

function EditListLink(props) {
    const StyleSelected = {borderLeft: "2px solid black", backgroundColor: "white"}
    const curSelected = props.curSelected
    const listType = props.listType

    return (
        <li style={curSelected == listType ? StyleSelected: {}}>
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