import { useQuery } from "react-query"
import { fetchUser } from "../pages/fetchFunctions";

export function useUser() {
    const {data, status} = useQuery("user", fetchUser)

    if (status == "loading") {return status}
    if (data == "404") {return null}

    return data.profile
}