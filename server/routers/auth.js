import express from "express";
import { pool } from "../utils/dbConfig.js";
import bcrypt from "bcryptjs";
import camelize from "camelize";
import snakeize from "snakeize";
import * as dotenv from "dotenv";
import validateRegistrationData from "../middlewares.js/validateRegistrationData.js";
dotenv.config();


export const router = express.Router();

/**
 * expects username and password fields in req
 * checks credentials and creates session for user if valid
 * if invalid, sets invalidCredentials field to true
 */
router.post("/sign-in", async (req, res) => {
    const { username , password } = req.body;
    //Missing username/password
    if(!username || !password){
        res.status(400);
    }
    const account = camelize(await pool.query("SELECT account_uid, username, passhash FROM account WHERE username=$1", [username])).rows[0];
    //No user with username
    if(!account){
        res.status(401).json({ invalidCredentials: true });
        return;
    }
    //Authenticated
    if(await bcrypt.compare(password, account.passhash)){
        req.session.accountUid = account.accountUid;
        res.status(200).send(`user ${username} authenticated`);
        
    }
    //Wrong password
    else{
        res.status(401).json({ invalidCredentials: true });
        return;
    }
});

/**
 * expects username, email, password, and address fields in req
 * address should have fields address1, city, province, postalCode, and optional fields address2, address3
 * validates data
 * if valid, creates account and creates session for user
 * if invalid, sets field invalidFIELD to true where FIELD is username, password, email, address1,
 * city, province, or postalCode. also sets usernameTaken and emailTaken to true if username/email taken
 */
router.post("/register", validateRegistrationData, async (req, res) => {
    const { username , email, password, address1, address2, address3, city, province, postalCode } = req.body;
    var addressUid = camelize(await pool.query("SELECT get_address_uid($1, $2, $3, $4, $5, $6) AS address_uid", 
    [address1, address2, address3, city, province, postalCode])).rows[0].addressUid;
    if(!addressUid){
        addressUid = camelize(await pool.query(`INSERT INTO address(address1, address2, address3, city, province, postal_code) 
        VALUES($1, $2, $3, $4, $5, $6) RETURNING address_uid`,
        [address1, address2, address3, city, province, postalCode])).rows[0].addressUid;
    }
    const passhash = await bcrypt.hash(password, 12);
    const accountUid = camelize(await pool.query(`INSERT INTO account (username, email, address_uid, passhash)
     VALUES ($1, $2, $3, $4) RETURNING account_uid`, [username, email, addressUid, passhash])).rows[0].accountUid;
     req.session.account = {
        accountUid: accountUid
    }
     res.status(201).send(`user ${username} created`);
});

router.get("/sign-out", async (req, res) => {
    req.session.destroy();
    res.status(200).send("signed out");
});