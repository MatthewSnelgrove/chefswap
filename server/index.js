import express from 'express';
import session from 'express-session';
import { pool } from "./dbConfig.js";
import path from 'path';
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 3001;
const app = express();
// // Have Node serve the files for our built React app
// app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use(cookieParser());
app.use(session({
  secret: "g66gGG7goHjfanAAaD138m",
  resave: false,
  saveUninitialized: false
}));

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

import { router as authRouter } from "./routers/auth.js";
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});