import express from "express";
import session from 'express-session'; 
import { hashPassword, generateHashedPassword } from "../utils/helpers.js";
import { pool } from "../dbConfig.js";
import { v4 as uuidv4 } from "uuid";

export const router = express.Router();

router.use(express.json());

router.get("/", async (req, res) => {
    // const address_uid = await pool.query("SELECT address_uid FROM address");
    const address_uid = await pool.query("SELECT get_address_uid($1, $2, $3, $4, $5, $6)", 
    ['69 Weed Way', 'appt 9', null, 'Victoria', 'British Columbia', 'V8W3M9']);
    res.send(address_uid.rows[0].get_address_uid);
    
});

router.post("/login", async (req, res) => {
    const { username , password } = req.body;
    var account = await pool.query("SELECT username, salt, passhash FROM account WHERE username=$1", [username]);
    if(account.rowCount === 0){
        res.status(400).json({ invalidUsername: true, error: "invalid username" });
        return;
    }
    account = account.rows[0];
    const passhash = hashPassword(password, account.salt);
    if(account.passhash === passhash){
        res.send("authenticated");
    }
    else{
        res.send("not authenticated");
    }
});
router.post("/register", validateRegistrationData, async (req, res) => {
    const { username , email, password, address } = req.body;
    var addressUid = await pool.query("SELECT get_address_uid($1, $2, $3, $4, $5, $6)", 
    [address.address1, address.address2, address.address3, address.city, address.province, address.postalCode]);
    if(!addressUid.rows[0].get_address_uid){
        addressUid = uuidv4();
        await pool.query(`INSERT INTO address(address_uid, address_1, address_2, address_3, city, province, postal_code) 
        VALUES($1, $2, $3, $4, $5, $6, $7)`,
        [addressUid, address.address1, address.address2, address.address3, address.city, address.province, address.postalCode]);
    }
    else{
        addressUid = addressUid.rows[0].get_address_uid;
    }
    const passhashWithSalt = generateHashedPassword(password);
    await pool.query(`INSERT INTO account (username, email, address_uid, salt, passhash)
     VALUES ($1, $2, $3, $4, $5)`, [username, email, addressUid, passhashWithSalt.salt, passhashWithSalt.passhash]);
     res.send(`Registered ${username} successfully`);
});

async function validateRegistrationData(req, res, next){
    const { username , email, password, address } = req.body;
    if(!username){
        res.status(400).json({ invalidUsername: true, error: "invalid username" });
        return;
    }
    if(email.length > 80 || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
        res.status(400).json({ invalidEmail: true, error: "invalid email" });
        return;
    }
    if(!password){
        res.status(400).json({ invalidPassword: true, error: "invalid password" });
        return;
    }
    if(!address.address1){
        res.status(400).json({ invalidAddress1: true, error: "invalid address line 1" });
        return;
    }
    if(!address.city){
        res.status(400).json({ invalidCity: true, error: "invalid city" });
        return;
    }
    const provinces = ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan",
"Nova Scotia", "New Brusnwick", "Newfoundland and Labrador", "Prince Edward Island",
"Northwest Territories", "Yukon", "Nunavut"];
    if(!provinces.includes(address.province)){
        res.status(400).json({ invalidProvince: true, error: "invalid province" });
        return;
    }
    if(!/^([A-Z][0-9]){3}$/.test(address.postalCode)){
        res.status(400).json({ invalidPostalCode: true, error: "invalid postal code" });
        return;
    }
    const usernameTaken = await pool.query("SELECT username FROM account WHERE username=$1",[username]);
    if(usernameTaken.rowCount>0){
        res.status(400).json({ usernameTaken: true, error: "username already exists" });
        return;
    }
    const emailTaken = await pool.query("SELECT email FROM account WHERE email=$1", [email]);
    if(emailTaken.rowCount>0){
        res.status(400).json({ emailTaken: true, error: "email already exists" });
        return;
    }
    next();
}