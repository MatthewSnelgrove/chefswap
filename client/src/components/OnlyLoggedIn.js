import { React } from "react";
import { useUser } from "./useUser"

function OnlyLoggedIn(props) {
    const user = useUser()
    const globalVars = global.config

    if (user == globalVars.userStates.loading) {
        return (<></>)
    }

    if (user == null) {
        window.location = global.config.pages.login
        return (<></>)
    }

    return  (
        <>
            {props.children}
        </>
    )
}

export default OnlyLoggedIn