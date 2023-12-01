import { useEffect, useRef, useState } from "react";
import { useUser } from "../components/useUser.js"
import  socket  from "../utils/socket.js"



const useMessages = () => {
  const user = useUser()  
  const socketRef = useRef()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])

  function useSocketOperation(socketFunction, ...args) {
    socketRef.current.emit(socketFunction, ...args)
  }

  useEffect(() => {
    console.log(conversations)

    if (!socketRef.current) { return }
    // if (!socketRef.current || conversations.length === 0 ) { return }

    // socketRef.current.emit("JoinConversation", {interlocutorUid: "9405b073-70ee-4a5d-a2bd-dbfc3709846c"}, (d) => {})
    // socketRef.current.emit("LeaveConversation", { interlocutorUid:  "9405b073-70ee-4a5d-a2bd-dbfc3709846c"}, (d) => {console.log(d)})

    socketRef.current.emit("SendMessage", {message: {
    interlocutorUid: "9405b073-70ee-4a5d-a2bd-dbfc3709846c", 
    senderUid: "0913221f-e278-4e17-bfc4-436d7a5ee0c1",
    content: "ooga booga"
    }}, (d) => {console.log(d)})
  }, [conversations])

  useEffect(() => {
    if (!user) { return }

    socketRef.current = socket;

    
    socketRef.current.emit("GetConversations", setConversations)
    
    

  

  }, [user]);

  return {conversations, useSocketOperation}
};
export default useMessages;
