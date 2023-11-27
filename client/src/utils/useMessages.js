import { useEffect, useRef, useState } from "react";
import { useUser } from "../components/useUser.js"
import  socket  from "../utils/socket.js"



const useMessages = () => {
  const user = useUser()  
  const socketRef = useRef()
  const [conversations, setConversations] = useState([])

  function useSocketOperation(socketFunction, ...args) {
    socketRef.current.emit(socketFunction, ...args)
  }

  useEffect(() => {
    console.log(conversations)
  }, [conversations])


  useEffect(() => {
    if (!user) { return }

    socketRef.current = socket;

    
    socketRef.current.emit("GetConversations", setConversations)
    

  }, [user]);

  return {conversations, useSocketOperation}
};
export default useMessages;
