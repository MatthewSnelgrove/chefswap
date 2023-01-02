import { useEffect, useReducer, useState } from 'react'
import { getAllUsers } from '../utils/fetchFunctions'

function searchReducer(state, action) {
    switch (action.type) {
        case "new-swap": {
            return state.filter((filterUser) => filterUser.profile.accountUid != action.payload)
        }
        case "user-scroll": {
            return [...state, ...action.payload.slice(1, action.payload.length + 1)]
        }
        case "change-query": {
            return action.payload
        }
    }
}

function loadedData(setLoading, loadingDispatch, newData, type) {
    loadingDispatch({type: type, payload: newData})
    setLoading(false)
    console.log("getting new users")
}

//This violates open/close principle not really sure how to fix ths
function getOrderByString(orderBy, distance, rating, accountUid) {
    if (orderBy == "distanceAsc" || orderBy == "distanceDesc") {
        return `&key[accountUid]=${accountUid}&key[distance]=${distance * 1000}`
    }
    else {
        return `&key[accountUid]=${accountUid}}&key[avgRating]=${rating}`
    }
}

export function useSwapSearch(lastUser, user, userAddress, queryValues) {
    const [state, dispatch] = useReducer(searchReducer, [])
    const [loading, setLoading] = useState(false)
    const [isLastUser, setLastUser] = useState(false)

    useEffect(() => {
        if (user == global.config.userStates.loading || userAddress == null) {return}
        getAllUsers(userAddress.latitude, userAddress.longitude, user.accountUid, `${queryValues.cuisineChecked.map(e => "&cuisineSpeciality=" + e).join("")}&orderBy=${queryValues.orderBy}&limit=8`,
        (data) => loadedData(setLoading, dispatch, data, "change-query"))
    }, [userAddress])

    //make sure to include &minRating=${queryValues.rating}
    //make sure to include &maxDistance=${queryValues.distance * 1000}
    //TODO: fix setLastUser(false) based off of error data
    useEffect(() => {
        if (user == global.config.userStates.loading || userAddress == null || loading) {return}
        getAllUsers(userAddress.latitude, userAddress.longitude, user.accountUid, `${queryValues.cuisineChecked.map(e => "&cuisineSpeciality=" + e).join("")}&orderBy=${queryValues.orderBy}&limit=8`,
        (data) => {
            loadedData(setLoading, dispatch, data, "change-query")
            if (data) {
                setLastUser(false)
            }
        })
    }, [...Object.values(queryValues)])

    useEffect(() => {
        if (user == global.config.userStates.loading || userAddress == null || isLastUser) {return}
        setLoading(true)
        getAllUsers(userAddress.latitude, userAddress.longitude, null,  `${queryValues.cuisineChecked.map(e => "&cuisineSpeciality=" + e).join("")}&orderBy=${queryValues.orderBy}${getOrderByString(queryValues.orderBy, lastUser.distance, lastUser.rating, lastUser.accountUid)}&limit=8`,
        (data) => {
            loadedData(setLoading, dispatch, data, "user-scroll")
            if (data && data.length == 0) {
                setLastUser(true)
            }    
        })
    }, [lastUser])

    return [state, dispatch, loading]
}

