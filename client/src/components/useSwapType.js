import { getUsersOfSwapStatus } from "../utils/fetchFunctions";
import { useState, useEffect } from "react";
import { setUsersForSwapList } from "../utils/misc";
import { useUser } from "./useUser";



export function useSwapType(props) {
    const [swapTypeList, setSwapTypeList] = useState([])
    const user = useUser()
    const loading = global.config.userStates.loading
    
    useEffect(() => {
        if (user == loading) {return}
        getUsersOfSwapStatus(user, props.status, (data) => {setSwapTypeList(setUsersForSwapList(data))})
    }, [user])

    if (user == loading) return loading

    return [swapTypeList, setSwapTypeList]
}