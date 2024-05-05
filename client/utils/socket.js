import { io } from "socket.io-client";
import global_vars from "./config.js";

const socket = new io("https://chefswap-server.fly.dev/", {
  autoConnect: false,
  withCredentials: true,
});
export default socket;
