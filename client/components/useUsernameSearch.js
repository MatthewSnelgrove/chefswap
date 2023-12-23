import { React, useState, useEffect } from "react"
import { getAllUsers } from "../utils/fetchFunctions"
import { setUsersForSwapList } from "../utils/misc"

export function useUsernameSearch(userAddress, usernameQuery, userObserver) {
    const [users, setUsers] = useState([])
    
    useEffect(() => {
        if (userAddress == null) {return}
        getAllUsers(userAddress.latitude, userAddress.longitude, `&username=${usernameQuery}&limit=8`, setUsers)
    }, [userAddress])

    useEffect(() => {
        if (userAddress == null) {return}
        getAllUsers(userAddress.latitude, userAddress.longitude, `&username=${usernameQuery}&key[similarity]=${userObserver.similarity}&key[accountUid]=${userObserver.accountUid}&limit=8`, 
        (data) => {
            setUsers((curUsers) => [...curUsers, ...data])
        }
        )
    }, [userObserver])

    return [users, setUsers]
}