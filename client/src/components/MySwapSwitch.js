import React from 'react';


function MySwapSwitch(props) {
    
    return (
        <div className="btn-group" role="group" aria-label="Basic example" >
            <HighlightSwap hl={props.hl} />
            <HighlightMessages hl={props.hl} />
        </div>
    )
}

function HighlightSwap(hl) {
    if (hl.hl === "swaps") {
        return (
            <div className="btn-group btn-group-lg">
                <a type="button bg-info" className="btn btn-warning" href="http://localhost:3000/my-swaps">Swaps</a>
            </div>
        )
    }
    
    return (
        <div className="btn-group btn-group-lg">
            <a type="button bg-info" className="btn btn-secondary" href="http://localhost:3000/my-swaps">Swaps</a>
        </div>
    )
}

function HighlightMessages(hl) {
    if (hl.hl === "messages") {
        return (
            <div className="btn-group btn-group-lg">
                <a type="button bg-info" className="btn btn-warning" href="http://localhost:3000/my-messages">Messages</a>
            </div>
        )
    }
    
    return (
        <div className="btn-group btn-group-lg">
            <a type="button bg-info" className="btn btn-secondary" href="http://localhost:3000/my-messages">Messages</a>
        </div>
    )
}


export default MySwapSwitch