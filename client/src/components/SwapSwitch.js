import "./styles/SwapSwitch.css"

function linkToPage(link) {
    window.location = link
}

function SwapSwitch(props) {
    const pages = global.config.pages

    return (
        <div className="switch-container container">
            <button onClick={(e) => {linkToPage(pages.mySwaps)}} className={props.current == 0 ? "swap-click-button highlight-container": "swap-click-button non-highlight-container"}>
                <span className="material-icons-round swap-click-image">multiple_stop</span>
            </button>
            <button onClick={(e) => {linkToPage(pages.myMessages)}} className={props.current == 1 ? "message-button highlight-container": "message-button non-highlight-container"}>
                <span className="material-icons-round message-image">chat</span>
            </button>
        </div>
    )
}

export default SwapSwitch;