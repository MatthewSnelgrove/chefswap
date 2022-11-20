import { React, useEffect, useState } from "react";
import { getUser } from "../pages/fetchFunctions";
import { useUser } from "./useUser"

function OnlyLoggedIn(props) {
    const user = useUser()

    if (user == null) {
        window.location = props.linkPage
        return (<></>)
    }

    return  (
        <>
            {props.children}
        </>
    )
}

export default OnlyLoggedIn