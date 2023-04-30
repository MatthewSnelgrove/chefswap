import express from "express";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpecs } from "./configServices/swaggerConfig.js";
import http from "http";
import { Server } from "socket.io";
import * as OpenApiValidator from "express-openapi-validator";
import helmet from "helmet";
import { sessionMiddleware } from "./configServices/sessionConfig.js";
import { wrap } from "./configServices/sessionConfig.js";
import { corsConfig } from "./configServices/corsConfig.js";
import { BusinessError } from "./utils/errors.js";
// import * as iii from "./openapi.yaml";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });
const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(express.json());
app.use(cors(corsConfig));
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

// const uids = [
//   "36b83756-9a30-4779-a783-f40baad5782d",
//   "6611bbc5-2035-4304-b944-240dadb1f296",
//   "d935925e-5c70-4770-9c67-4d03557640fc",
//   "883bf1d3-6a25-49bd-bab9-ea365b400402",
// ];
// for (const uid of uids) {
//   console.log(`${uid} : ${slugid.encode(uid)}`);
// }

app.use(sessionMiddleware);

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
import { router as ratingsRouter } from "./routes/ratings.js";
import messagingHandler from "./socketEventHandlers/messagingHandler.js";
app.use("/api/v1/ratings", ratingsRouter);

app.use((err, req, res, next) => {
  //if multiple errors (from openapi validator) return those errors.
  //if one error (my custom errors) return array with just that error
  console.log("-----\nError: \n" + err + "\n-----");
  //BusniessError is a class for my custom errors
  if (err instanceof BusinessError) {
    console.log("err instanceof BusinessError");
    err.path = req.originalUrl;
    const errors = [err];
    res.status(err.status).json(errors);
  }
  //HttpError is a class from openapi validator. All schema validation errors are of this type
  else if (err instanceof HttpError) {
    console.log("err instanceof OpenApiValidator.HttpError");
    const errors = err.errors.map((error) => ({
      path: req.originalUrl,
      message: `${error.path} not valid`,
      detail: `${error.message}`,
    }));
    res.status(err.status).json(errors);
  }
  //Other errors are unknown system errors
  else {
    console.log("err is unknown system error");
    res.status(500).json({
      path: req.originalUrl,
      message: "unknown server error",
      detail: "request caused an unknown error on the server",
    });
  }
});

const io = new Server(server, { cors: corsConfig });
//lets socket use session middleware
io.use(wrap(sessionMiddleware));
io.on("connection", (socket, next) => {
  console.log(socket.request.session);
  socket.accountUid = socket.request.session.accountUid;
  if (!socket.accountUid) {
    next(new BusinessError(401, "not logged in", "must be logged in to chat"));
    return;
  }
  socket.join(socket.accountUid);
  console.log("a user connected");
  console.log("sessionId: " + socket.id);
  messagingHandler(io, socket);
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
