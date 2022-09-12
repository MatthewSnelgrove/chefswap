import express from 'express';
import session from 'express-session';
import { pool } from "./utils/dbConfig.js";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import bodyParser from "body-parser"
dotenv.config();
import pgSession from "connect-pg-simple";
import cors from "cors";


const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}))

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

app.get("/ibm", (req, res) => {
    console.log('Retrieving list of buckets');
    console.log(cos.listBuckets())
    .promise()
    .then((data) => {
        if (data.Buckets != null) {
            for (var i = 0; i < data.Buckets.length; i++) {
                console.log(`Bucket Name: ${data.Buckets[i].Name}`);
            }
        }
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
    res.send("done");
})

import { router as authRouter } from "./routers/auth.js";
app.use("/api/v1/auth", authRouter);
import { router as profilesRouter } from "./routers/profiles.js";
app.use("/api/v1/profiles", profilesRouter);
import { router as manageAccountRouter } from "./routers/manage-account.js";
app.use("/api/v1/manage-account", manageAccountRouter);
import { router as mySwapsRouter } from "./routers/my-swaps.js"; 
app.use("/api/v1/my-swaps", mySwapsRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});