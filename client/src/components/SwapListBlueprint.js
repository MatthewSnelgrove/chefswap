import React from "react";
import "./styles/SwapListBlueprint.css"

function SwapListBlueprint(props) {
    const loading = global.config.userStates.loading
    
    if (props.data == loading) {return (<></>)}
    
    return (
        <div className="container">
            <div className="swap-type-container">
            <div>
                <h2>{props.type}</h2>
            </div>
            </div>
            <div className="list-container">
                {props.children}
                <span className="no-type-text">{props.data.length == 0 ? `No users of type ${props.type.toLowerCase()}`: ""}</span>
            </div>
        </div>
    );
}

export default SwapListBlueprint;