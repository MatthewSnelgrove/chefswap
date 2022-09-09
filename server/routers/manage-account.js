import express from "express";
import { pool } from "../dbConfig.js";
import camelize from "camelize";
import snakeize from "snakeize";
import checkAuth from "../middlewares.js/checkAuth.js";
import { validateAddress, validateUsername, validateBio } from "../utils/dataValidation.js";
import { createSetString } from "../utils/queryHelpers.js";
export const router = express.Router();

/**
 * Get all user data
 */
router.get("/", checkAuth, async (req, res) => {
    const accountUid = req.session.accountUid;
    const account = camelize(await pool.query(`SELECT account.username, account.email, account.bio,
    account.create_time, account.update_time, address.address_1, address.address_2, address.address_3, 
    address.city, address.province, address.postal_code, circle.circle_radius, circle.circle_centre, 
    pfp.pfp_link FROM account JOIN address USING (address_uid) LEFT JOIN circle USING (circle_uid)
    LEFT JOIN pfp USING (pfp_uid) WHERE account_uid=$1`, [accountUid])).rows[0];
    var images = camelize(await pool.query(`SELECT image_link, timestamp FROM image WHERE 
    account_uid=$1`, [accountUid])).rows[0];
    account.images = images ? images : null;
    res.json(account);
});

/**
 * updates username if valid and available. responds with new username if successful
 */
 router.post("/username", checkAuth, async (req, res) => {
    const accountUid = req.session.accountUid;
    const username = req.body.username;
    //validate new username
    const error = {};
    validateUsername(username, error);
    if(Object.keys(error).length){
        res.status(401).json(error);
        return;
    }
    await pool.query(`UPDATE account SET username=$1 WHERE account_uid=$2`,[username, accountUid]);
    res.status(200).send(username);
});

/**
 * updates email if valid and available. responds with new email if successful
 */
 router.post("/email", checkAuth, async (req, res) => {
    const accountUid = req.session.accountUid;
    const email = req.body.email;
    //validate new email
    const error = {};
    validateEmail(email, error);
    if(Object.keys(error).length){
        res.status(401).json(error);
        return;
    }
    await pool.query(`UPDATE account SET email=$1 WHERE account_uid=$2`,[email, accountUid]);
    res.status(200).send(email);
});

/**
 * updates address if valid. responds with new address if successful
 */
 router.post("/address", checkAuth, async (req, res) => {
    const accountUid = req.session.accountUid;
    const addressUid = camelize(await pool.query(`SELECT address_uid FROM account WHERE account_uid=$1`,
    [accountUid])).rows[0].addressUid;
    //parse only wanted fields from body
    const address = camelize(req.body);
    for(const key of Object.keys(address)){
        if(!["address1", "address2", "address3", "city", "province", "postalCode"].includes(key)){
            delete address[key];
        }
    }
    // console.log(address);
    if(!Object.keys(address).length){
        res.status(400).send("no changes");
        return;
    }
    //validate new address
    const error = {};
    validateAddress(address, error, false);
    if(Object.keys(error).length){
        res.status(401).json(error);
        return;
    }
    const setString = createSetString(address);
    await pool.query(`UPDATE address SET ${setString} WHERE address_uid=$1`, [addressUid]);
    res.status(200).send(address);
});

/**
 * updates bio if valid and available. responds with new bio if successful
 */
 router.post("/bio", checkAuth, async (req, res) => {
    const accountUid = req.session.accountUid;
    const bio = req.body.bio;
    //validate new bio
    const error = {};
    validateBio(bio, error);
    if(Object.keys(error).length){
        res.status(401).json(error);
        return;
    }
    await pool.query(`UPDATE account SET bio=$1 WHERE account_uid=$2`,[bio, accountUid]);
    res.status(200).send(bio);
});