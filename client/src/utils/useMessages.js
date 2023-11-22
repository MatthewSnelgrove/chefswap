import { useEffect, useRef, useState } from "react";
import { useUser } from "../components/useUser.js"
import { socket } from "../utils/socket.js"

const useMessages = () => {
  const user = useUser()  
  const socketRef = useRef()
  const [conversations, setConversations] = useState([])


  useEffect(() => {
    if (!user) { return }

    socketRef.current = socket;

    socketRef.current.emit("GetConversations", setConversations)
    

  }, [user]);
};
export default useMessages;
