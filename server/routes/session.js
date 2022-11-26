import express from "express";
import { pool } from "../configServices/dbConfig.js";
import bcrypt from "bcryptjs";
import camelize from "camelize";
import * as dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

export const router = express.Router();

const sessionNotFound = {
  status: 404,
  message: "session not found",
  detail: "no active session",
};

router.get("/", async (req, res, next) => {
  if (!req.session.accountUid) {
    next(sessionNotFound);
    return;
  }
  req.session.touch();
  res.json(req.session);
});

/**
 * expects username and password fields in req
 * checks credentials and creates session for user if valid
 * if invalid, sets invalidCredentials field to true
 */
router.post("/", async (req, res, next) => {
  const { username, password } = req.body;
  const account = camelize(
    await pool.query(
      `SELECT account_uid, username, passhash 
      FROM account 
      WHERE username=$1`,
      [username]
    )
  ).rows[0];
  //No user with username
  const invalidCredentials = {
    status: 401,
    message: "Invalid credentials",
    detail: "The provided username/password is invalid",
  };
  if (!account) {
    next(invalidCredentials);
    return;
  }
  //valid username, password
  if (await bcrypt.compare(password, account.passhash)) {
    req.session.accountUid = account.accountUid;
    res.status(201).json(req.session);
  }
  //Wrong password
  else {
    next(invalidCredentials);
    return;
  }
});

/**
 * expects username and password fields in req
 * checks credentials and creates session for user if valid
 * if invalid, sets invalidCredentials field to true
 */
router.delete("/", async (req, res, next) => {
  const accountUid = req.session.accountUid;
  //not signed in
  if (!accountUid) {
    next(sessionNotFound);
    return;
  }
  req.session.destroy(() => {
    res
      .clearCookie("connect.sid", {
        path: "/",
      })
      .sendStatus(204);
  });
});
