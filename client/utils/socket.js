import { io } from "socket.io-client";
import global_vars from "./config.js";

const socket = new io("http://localhost:3001/", {
  autoConnect: false,
  withCredentials: true,
});
export default socket;
