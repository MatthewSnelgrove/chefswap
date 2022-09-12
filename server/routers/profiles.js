import express from "express";
import { pool } from "../utils/dbConfig.js";
import camelize from "camelize";
import { generateImageLink } from "../utils/imageHelpers.js";

export const router = express.Router();

/**
 * Get publically available data for user
 */
router.get("/:username", async (req, res) => {
    const username = req.params.username;
    var accountUid = camelize(await pool.query(`SELECT account_uid from account WHERE username=$1`,
    [username])).rows[0];
    if(!accountUid){
        res.status(404).send(`user ${req.params.username} not found`);
        return;
    }
    accountUid = accountUid.accountUid;
    const account = camelize(await pool.query(`SELECT account.username, account.bio, circle.circle_radius,
    circle.circle_centre, pfp.pfp_link
    FROM account LEFT JOIN circle USING (circle_uid) LEFT JOIN pfp USING (pfp_uid) 
    WHERE username=$1`, [username])).rows[0];
    console.log(account);
    const cuisinePreferences = camelize(await pool.query(`SELECT preference FROM 
    cuisine_preference WHERE account_uid=$1`, [accountUid])).rows;
    const cuisineSpecialities = camelize(await pool.query(`SELECT speciality FROM 
    cuisine_speciality WHERE account_uid=$1`, [accountUid])).rows;
    account.cuisinePreferences = cuisinePreferences.map(pref => pref.preference);
    account.cuisineSpecialities = cuisineSpecialities.map(spec => spec.speciality);
    if(account.centre){
        account.latitude = account.centre[0];
        account.longitude = account.centre[1];
        delete account.centre;
    }
    const images = camelize(await pool.query(`SELECT image_link, timestamp FROM image WHERE 
    account_uid=$1`, [accountUid])).rows;
    for(const image of images){
        image.imageLink = generateImageLink(image.imageLink);
    }
    account.images = images;
    res.status(200).json(account);
});
