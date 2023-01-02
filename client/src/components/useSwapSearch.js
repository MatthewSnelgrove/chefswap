import { useEffect, useReducer, useState } from 'react'
import { getAllUsers } from '../utils/fetchFunctions'

function searchReducer(state, action) {
    switch (action.type) {
        case "new-swap": {
            return state.filter((filterUser) => filterUser.profile.accountUid != action.payload)
        }
        case "user-scroll": {
            return [...state, ...action.payload]
        }
        case "change-query": {
            return action.payload
        }
    }
}

function loadedData(setLoading, loadingDispatch, newData, type) {
    loadingDispatch({type: type, payload: newData})
    setLoading(false)
    console.log(newData)
}

export function useSwapSearch(lastUser, setLastUser, user, userAddress, queryValues) {
    const [state, dispatch] = useReducer(searchReducer, [])
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        if (user == global.config.userStates.loading || userAddress == null) {return}
        getAllUsers(userAddress.latitude, userAddress.longitude, user.accountUid, `${queryValues.cuisineChecked.map(e => "&cuisineSpeciality=" + e).join("")}&orderBy=${queryValues.orderBy}&limit=8`,
        (data) => loadedData(setLoading, dispatch, data, "change-query"))
    }, [userAddress])

    //make sure to include &minRating=${queryValues.rating}
    //make sure to include &maxDistance=${queryValues.distance * 1000}
    useEffect(() => {
        if (user == global.config.userStates.loading || userAddress == null || loading) {return}
        getAllUsers(userAddress.latitude, userAddress.longitude, user.accountUid, `${queryValues.cuisineChecked.map(e => "&cuisineSpeciality=" + e).join("")}&orderBy=${queryValues.orderBy}&limit=8`,
        (data) => loadedData(setLoading, dispatch, data, "change-query"))
    }, [...Object.values(queryValues)])

    useEffect(() => {
        if (user == global.config.userStates.loading || userAddress == null || loading) {return}
        setLoading(true)
        getAllUsers(userAddress.latitude, userAddress.longitude, null,  `${queryValues.cuisineChecked.map(e => "&cuisineSpeciality=" + e).join("")}&orderBy=${queryValues.orderBy}&key[accountUid]=${lastUser.accountUid}&key[distance]=${Math.floor(lastUser.distance) * 1000}&limit=8`,
        (data) => loadedData(setLoading, dispatch, data, "user-scroll"))
    }, [lastUser])

    return [state, dispatch, loading]
}

