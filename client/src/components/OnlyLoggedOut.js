import { React } from "react";
import { useUser } from "./useUser"

function OnlyLoggedOut(props) {
    const user = useUser()
    const globalVars = global.config

    if (user == globalVars.userStates.loading) {
        return (<></>)
    }

    if (user != globalVars.userStates.loading && user != null) {
        window.location = globalVars.pages.homepage
        return (<></>)
    }

    return  (
        <>
            {props.children}
        </>
    )
}

export default OnlyLoggedOut