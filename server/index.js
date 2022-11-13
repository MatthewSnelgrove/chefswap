import express from "express";
import session from "express-session";
import { pool } from "./configServices/dbConfig.js";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });
import pgSession from "connect-pg-simple";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpecs } from "./configServices/swaggerConfig.js";
import http from "http";
import { Server } from "socket.io";
import * as OpenApiValidator from "express-openapi-validator";
import slugid from "slugid";
// import * as iii from "./openapi.yaml";

const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);
const io = new Server(server);
io.on("connection", (socket) => {
  console.log("a user connected");
});
app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, { explorer: true })
);

const store = new (pgSession(session))({
  pool: pool,
});

// const uids = [
//   "36b83756-9a30-4779-a783-f40baad5782d",
//   "6611bbc5-2035-4304-b944-240dadb1f296",
//   "d935925e-5c70-4770-9c67-4d03557640fc",
//   "883bf1d3-6a25-49bd-bab9-ea365b400402",
// ];
// for (const uid of uids) {
//   console.log(`${uid} : ${slugid.encode(uid)}`);
// }

app.use(
  session({
    store: store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: {
      httpOnly: false,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24, //24 hours, reset on activity
    },
  })
);

app.use(
  OpenApiValidator.middleware({
    apiSpec: "./server/openapi.yaml",
    validateRequests: true, // (default)
    validateResponses: false, // false by default
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
import { router as swapsRouter } from "./routes/swaps.js";

app.use("/api/v1/swaps", swapsRouter);

app.use((err, req, res, next) => {
  //if multiple errors (from openapi validator) return those errors.
  //if one error (my custom errors) return array with just that error
  console.log(err);
  const errors = err.errors
    ? err.errors.map((error) => ({
        path: req.originalUrl,
        message: `${error.path} not valid`,
        detail: `${error.message}`,
      }))
    : [
        {
          path: req.originalUrl,
          message: err.message || "unknown server error",
          detail:
            err.detail ||
            err.message ||
            "request caused an unknown error on the server",
        },
      ];
  res.status(err.status || 500).json(errors);
});

app.use((err, req, res, next) => {
  //if multiple errors (from openapi validator) return those errors.
  //if one error (my custom errors) return array with just that error
  //generated by openapi validator
  res.status(err.status || 500).json(err.errors);
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
