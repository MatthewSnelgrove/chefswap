import { useQuery } from "react-query"
import { fetchUser } from "../utils/fetchFunctions";

export function useUser() {
    const {data, status} = useQuery("user", fetchUser)

    if (status == "loading") {return status}
    //TODO: make this go to an error page if the server is down
    // if (status == "error") {return null}
    if (data.status == 404) {return null}
    
    return data.profile
}