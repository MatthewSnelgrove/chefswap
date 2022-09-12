import express from "express";
import { pool } from "../utils/dbConfig.js";
import camelize from "camelize";
import snakeize from "snakeize";
import checkAuth from "../middlewares.js/checkAuth.js";
import { validateAddress, validateUsername, validateBio, validateImageName } from "../utils/dataValidation.js";
import { createSetString } from "../utils/queryHelpers.js";
import { bucket } from "../utils/cloudStorageConfig.js";
import { uploadHandler } from "../utils/imageHelpers.js";
import uuid4 from "uuid4";
import { generateImageLink } from "../utils/imageHelpers.js";
import { generateImageName } from "../utils/imageHelpers.js";
import * as dotenv from "dotenv";
dotenv.config();

export const router = express.Router();

/**
 * Get all user data
 */
router.get("/", checkAuth, async (req, res) => {
    const accountUid = req.session.accountUid;
    const account = camelize(await pool.query(`SELECT account.username, account.email, account.bio,
    account.pfp_link, account.create_time, account.update_time, address.address1, address.address2, 
    address.address3, address.city, address.province, address.postal_code, circle.circle_radius, 
    circle.circle_centre FROM account JOIN address USING (address_uid) LEFT JOIN circle USING 
    (circle_uid) WHERE account_uid=$1`, [accountUid])).rows[0];
    account.pfpLink = account.pfpLink ? generateImageLink(account.pfpLink) : null;
    const images = camelize(await pool.query(`SELECT image_link, timestamp FROM image WHERE 
    account_uid=$1`, [accountUid])).rows;
    for(const image of images){
        image.imageLink = generateImageLink(image.imageLink);
    }
    account.images = images;
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
 * updates bio if valid. responds with new bio if successful
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

router.delete("/gallery/", checkAuth, async (req, res) => {
    const accountUid = req.session.accountUid;
    const imageLink = req.body.imageLink;
    const imageName = generateImageName(imageLink);
    if(!imageName){
        res.status(400).send(`invalid imageLink ${imageLink}`);
        return;
    }
    const image = (await pool.query(`DELETE FROM image WHERE image_link=$1 RETURNING image_link`,
    [imageName])).rows[0];
    if(!image){
        res.status(400).send(`no image ${imageLink}`);
        return;
    }
    await bucket.file(imageName).delete();
    res.send(`deleted file ${imageName}`);
})

router.post("/gallery", checkAuth, uploadHandler.single("file"), async (req, res) => {
    const accountUid = req.session.accountUid;
    const imageName = req.file.originalname;
    const error = {};
    validateImageName(imageName, error);
    if(Object.keys(error).length){
        res.status(400).send("image must be a .png, .jpg, or .jpeg");
        return;
    }
    const blob = bucket.file(uuid4() + imageName);
    const blobStream = blob.createWriteStream();
    blobStream.on("error", err => (console.log(err)));
    blobStream.on("finish", async () => {
            await pool.query(`INSERT INTO image (account_uid, image_link) VALUES ($1, $2)`, 
            [accountUid, blob.name]);
    })
    blobStream.end(req.file.buffer);
    res.send(`uploaded file ${req.file.originalname}`);
});

router.put("/pfp", checkAuth, uploadHandler.single("file"), async (req, res) => {
    const accountUid = req.session.accountUid;
    const imageName = req.file.originalname;
    const error = {};
    validateImageName(imageName, error);
    if(Object.keys(error).length){
        res.status(400).send("image must be a .png, .jpg, or .jpeg");
        return;
    }
    const blob = bucket.file(uuid4() + imageName);
    const blobStream = blob.createWriteStream();
    blobStream.on("error", err => (console.log(err)));
    blobStream.on("finish", async () => {
            await pool.query(`UPDATE account SET pfp_link=$1 WHERE account_uid=$2`, 
            [blob.name, accountUid]);
    })
    blobStream.end(req.file.buffer);
    res.send(`uploaded file ${imageName}`);
});