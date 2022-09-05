import express from "express";
import { pool } from "../dbConfig.js";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config();


export const router = express.Router();

/**
 * expects username and password fields in req
 * checks credentials and creates session for user if valid
 * if invalid, sets invalidCredentials field to true
 */
router.post("/login", async (req, res) => {
    const { username , password } = req.body;
    const account = await pool.query("SELECT account_uid, username, passhash FROM account WHERE username=$1", [username]);
    if(account.rowCount === 0){
        res.status(400).json({ invalidCredentials: true });
        return;
    }
    if(await bcrypt.compare(password, account.rows[0].passhash)){
        req.session.account = {
            account_uid: account.rows[0].account_uid
        }
        res.status(200).send(`user ${username} authenticated`);
    }
    else{
        res.status(400).json({ invalidCredentials: true });
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
    const { username , email, password, address } = req.body;
    var addressUid = await pool.query("SELECT get_address_uid($1, $2, $3, $4, $5, $6) AS address_uid", 
    [address.address1, address.address2, address.address3, address.city, address.province, address.postalCode]);
    if(!addressUid.rows[0].address_uid){
        addressUid = await pool.query(`INSERT INTO address(address_1, address_2, address_3, city, province, postal_code) 
        VALUES($1, $2, $3, $4, $5, $6) RETURNING address_uid`,
        [address.address1, address.address2, address.address3, address.city, address.province, address.postalCode]);
    }
    addressUid = addressUid.rows[0].address_uid;
    const passhash = await bcrypt.hash(password, 12);
    const accountUid = await pool.query(`INSERT INTO account (username, email, address_uid, passhash)
     VALUES ($1, $2, $3, $4) RETURNING account_uid`, [username, email, addressUid, passhash]);
     req.session.account = {
        accountUid: accountUid.rows[0].account_uid
    }
     res.status(201).send(`user ${username} created`);
});

async function validateRegistrationData(req, res, next){
    const { username , email, password, address } = req.body;
    var error = {};
    if(!username){
        error.invalidUsername = true;
    }
    if(email.length > 80 || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
        error.invalidEmail = true;
    }
    if(!password){
       error.invalidPassword = true;
    }
    if(!address.address1){
        error.invalidAddress1 = true;
    }
    if(!address.city){
        error.invalidCity = true;
    }
    const provinces = ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan",
"Nova Scotia", "New Brusnwick", "Newfoundland and Labrador", "Prince Edward Island",
"Northwest Territories", "Yukon", "Nunavut"];
    if(!provinces.includes(address.province)){
        error.invalidProvince = true;
    }
    if(!/^([A-Z][0-9]){3}$/.test(address.postalCode)){
        error.invalidPostalCode = true;
    }
    const usernameTaken = await pool.query("SELECT username FROM account WHERE username=$1",[username]);
    if(usernameTaken.rowCount>0){
        error.usernameTaken = true;
    }
    const emailTaken = await pool.query("SELECT email FROM account WHERE email=$1", [email]);
    if(emailTaken.rowCount>0){
        error.emailTaken = true;
    }
    //if any errors
    if(error.length){
        res.status(400).json(error);
        return;
    }
    next();
}
