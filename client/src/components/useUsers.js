import { useQuery } from "react-query"
import { getAllUsers } from "../pages/fetchFunctions";

export function useUsers() {
    const {data, status} = useQuery("users", getAllUsers)

    if (status == "loading") {return status}
    if (data == "404") {return null}

    return data
}