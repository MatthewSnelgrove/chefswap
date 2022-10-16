import express from "express";
import { pool } from "../configServices/dbConfig.js";
import bcrypt from "bcryptjs";
import camelize from "camelize";
import * as dotenv from "dotenv";
dotenv.config();

export const router = express.Router();

const sessionNotFound = {
  status: 404,
  message: "session not found",
  detail: "no active session",
};

router.get("/", async (req, res) => {
  if (!req.session.accountUid) {
    next( sessionNotFound);
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
router.post("/", async (req, res) => {
  const { username, password } = req.body;
  //Missing username/password
  if (!username || !password) {
    res.status(400);
  }
  const account = camelize(
    await pool.query(
      `SELECT account_uid, username, passhash 
      FROM account 
      WHERE username=$1`,
      [username]
    )
  ).rows[0];
  //No user with username
  if (!account) {
    res.status(401).json({ invalidCredentials: true });
    return;
  }
  //valid username, password
  if (await bcrypt.compare(password, account.passhash)) {
    req.session.accountUid = account.accountUid;
    res.status(201).send(req.session);
  }
  //Wrong password
  else {
    res.status(401).json({ invalidCredentials: true });
    return;
  }
});

/**
 * expects username and password fields in req
 * checks credentials and creates session for user if valid
 * if invalid, sets invalidCredentials field to true
 */
router.delete("/", async (req, res) => {
  const accountUid = req.session.accountUid;
  //not signed in
  if (!accountUid) {
    res.sendStatus(401);
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
