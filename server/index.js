import express from 'express';
import session from 'express-session';
import { pool } from "./dbConfig.js";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
dotenv.config();
import pgSession from "connect-pg-simple";

const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(cookieParser());

const store = new (pgSession(session))({
  pool: pool
});


app.use(session({
  store: store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
      httpOnly: false,
      secure: false
  }
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