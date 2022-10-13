import express from "express";
import session from "express-session";
import { pool } from "./configServices/dbConfig.js";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";
dotenv.config();
import pgSession from "connect-pg-simple";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpecs } from "./configServices/swaggerConfig.js";

const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// console.log(swaggerSpecs);
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, { explorer: true })
);

const store = new (pgSession(session))({
  pool: pool,
});

app.use(
  session({
    store: store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: false,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24, //24 hours
    },
  })
);

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Retrieve a list of JSONPlaceholder users
 *     description: Retrieve a list of users from JSONPlaceholder. Can be used to populate a list of fake users when prototyping or testing an API.
 */
// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

import { router as sessionRouter } from "./routes/session.js";
app.use("/api/v1/session", sessionRouter);
import { router as accountsRouter } from "./routes/accounts.js";
app.use("/api/v1/accounts", accountsRouter);
import { router as mySwapsRouter } from "./routes/my-swaps.js";
app.use("/api/v1/my-swaps", mySwapsRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
