import express from "express";
import { pool } from "../dbConfig.js";
import camelize from "camelize";
import checkAuth from "../middlewares.js/checkAuth.js";

export const router = express.Router();

//get info about swap
router.get("/", checkAuth, async (req, res) => {
    const accountUid = req.session.accountUid;
    console.log(accountUid);
    const swaps = camelize(await pool.query(`SELECT swap.request_timestamp, swap.accept_timestamp,
    swap.end_timestamp, swap.account1_rating, swap.account2_rating, account1.username AS account1_username, 
    account2.username AS account2_username FROM swap JOIN account AS account1 ON 
    account1_uid=account1.account_uid JOIN account AS account2 ON account2_uid=account2.account_uid 
    WHERE swap.account1_uid=$1 OR swap.account2_uid=$1`, [accountUid])).rows;
    res.json(swaps);
});

//create swap in db
router.post("/request", checkAuth, async ( req, res) => {
    const swapperName = req.body.swapperName;
    const accountUid = req.session.accountUid;
    if(!swapperName){
        res.status(400).send("swapperName required");
        return;
    }
    try{
        const queryRes = (await pool.query(`INSERT INTO swap (account1_uid, account2_uid) SELECT $1, 
        account_uid FROM account WHERE username=$2 RETURNING account2_uid`, [accountUid, swapperName])).rows[0];
        if(!queryRes){
            res.status(400).send(`${swapperName} not found`);
        }
        else{
            res.send(`sent swap request to ${swapperName}`);
        }
        
    } catch(e){
        //UNIQUE error code => {account1_uid, account2_uid} pair already exists in swaps
        if(e.code == 23505){
            res.status(400).send(`swap with ${swapperName} already exists`);
        }        
        //CHECK error code => swapperName has same account_uid as client user
        else if(e.code == 23514){
            res.status(400).send("cannot swap with yourself");
        }
    }
});

//add accept time
router.post("/accept", checkAuth, async (req, res) => {
    const swapperName = req.body.swapperName;
    const accountUid = req.session.accountUid;
    if(!swapperName){
        res.status(400).send("swapperName required");
        return;
    }
    const queryRes = (await pool.query(`UPDATE swap SET accept_timestamp=now() FROM account WHERE 
    accept_timestamp IS NULL AND account.username=$1 AND swap.account1_uid=account.account_uid AND 
    swap.account2_uid=$2 RETURNING account.username`, [swapperName, accountUid])).rows[0];
    if(!queryRes){
        res.status(400).send(`no pending swap request from ${swapperName}`);
    }
    else{
        res.send(`accepted swap request from ${swapperName}`);
    }
});

//remove swap in db
router.post("/reject", checkAuth, async (req, res) => {
    const swapperName = req.body.swapperName;
    const accountUid = req.session.accountUid;
    if(!swapperName){
        res.status(400).send("swapperName required");
        return;
    }
    //uid1=requester, uid2=accepter
    const queryRes = (await pool.query(`DELETE FROM swap WHERE accept_timestamp IS NULL AND 
    swap.account1_uid IN (SELECT account_uid FROM account WHERE username=$1) AND swap.account2_uid=$2
    RETURNING account2_uid`, [swapperName, accountUid])).rows[0];
    if(!queryRes){
        res.status(400).send(`no pending request from ${swapperName}`);
    }
    else{
        res.send(`rejected swap request from ${swapperName}`);
    }
});

//remove swap from db
router.post("/cancel", checkAuth, async (req, res) => {
    const swapperName = req.body.swapperName;
    const accountUid = req.session.accountUid;
    if(!swapperName){
        res.status(400).send("swapperName required");
        return;
    }
    //uid1=requester, uid2=accepter
    const queryRes = (await pool.query(`DELETE FROM swap WHERE accept_timestamp IS NULL AND 
    swap.account2_uid IN (SELECT account_uid FROM account WHERE username=$1) AND swap.account1_uid=$2
    RETURNING account2_uid`, [swapperName, accountUid])).rows[0];
    if(!queryRes){
        res.status(400).send(`no pending request sent to ${swapperName}`);
    }
    else{
        res.send(`cancelled swap request to ${swapperName}`);
    }
});

//add end time
router.post("/end", checkAuth, async(req, res) => {
    const swapperName = req.body.swapperName;
    const accountUid = req.session.accountUid;
    if(!swapperName){
        res.status(400).send("swapperName required");
        return;
    }
    const queryRes = (await pool.query(`UPDATE swap SET end_timestamp=now() FROM account WHERE 
    accept_timestamp IS NOT NULL AND end_timestamp IS NULL AND account.username=$1 AND 
    ((swap.account1_uid=account.account_uid AND swap.account2_uid=$2) OR 
    (swap.account2_uid=account.account_uid AND swap.account1_uid=$2)) RETURNING account.username`, 
    [swapperName, accountUid])).rows[0];
    if(!queryRes){
        res.status(400).send(`no ongoing match with ${swapperName}`);
    }
    else{
        res.send(`ended swap with ${swapperName}`);
    }
});

//add rating
router.post("/rate", checkAuth, async(req, res) => {
    const { swapperName, rating }= req.body;
    const accountUid = req.session.accountUid;
    if(!swapperName){
        res.status(400).send("swapperName required");
        return;
    }
    if(!Number.isInteger(rating) || rating < 1 || rating > 5){
        res.status(400).send("rating must be an integer between 0 and 5");
        return;
    }
    const account1Uid = camelize(await pool.query(`SELECT swap.account1_uid FROM swap JOIN account AS account1 ON 
    account1_uid=account1.account_uid JOIN account AS account2 ON account2_uid=account2.account_uid 
    WHERE (swap.account1_uid=$1 OR swap.account2_uid=$1) AND swap.accept_timestamp IS NOT NULL AND 
    swap.end_timestamp IS NOT NULL`,[accountUid])).rows[0].account1Uid;
    if(!account1Uid){
        res.status(400).send(`no ended swap with ${swapperName}`);
        return;
    }
    //user is the first account in swap (requester)
    if(accountUid == account1Uid){
        await pool.query(`UPDATE swap SET account2_rating=$1`,[rating]);
        res.send(`set rating to ${rating} for ${swapperName}`);
    }
    else{
        await pool.query(`UPDATE swap SET account1_rating=$1`,[rating]);
        res.send(`set rating to ${rating} for ${swapperName}`);
    }
});