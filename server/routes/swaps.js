import express from "express";
import { pool } from "../configServices/dbConfig.js";
import camelize from "camelize";
import slugToUuid from "../utils/slugToUuid.js";
import { validateRating } from "../utils/dataValidation.js";
import uuid4 from "uuid4";

export const router = express.Router();

function generateRequesterString(requesterSlugs) {
  var string = "";
  if (Array.isArray(requesterSlugs)) {
    for (const requesterSlug of requesterSlugs) {
      const requesterUid = slugToUuid(requesterSlug);
      string +=
        string === ""
          ? `(requester_uid='${requesterUid ? requesterUid : uuid4()}'`
          : ` OR requester_uid='${requesterUid ? requesterUid : uuid4()}'`;
    }
    string += ")";
  } else if (requesterSlugs) {
    const requesterUid = slugToUuid(requesterSlugs);
    string += `requester_uid='${requesterUid ? requesterUid : uuid4()}'`;
  }
  return `${string}`;
}

//get info about swap
router.get("/", async (req, res) => {
  const requesterSlugs = req.query.requester;
  const requestString = generateRequesterString(requesterSlugs);
  const accountUid = req.session.accountUid;
  const swaps = camelize(
    await pool.query(
      `SELECT 
      requester_uid,
      requestee_uid,
      request_timestamp, 
      accept_timestamp,
      end_timestamp, 
      requester_rating, 
      requestee_rating
      FROM swap
      WHERE (swap.requester_uid=$1 OR swap.requestee_uid=$1) 
      ${requestString ? " AND " + requestString : ""}`,
      [accountUid]
    )
  ).rows;
  res.status(200).json(swaps);
});

router.post("/:requesterSlug/:requesteeSlug", async (req, res) => {
  const { requesterSlug, requesteeSlug } = req.params;
  const status = req.body.status;
  const requesterUid = slugToUuid(requesterSlug);
  const requesteeUid = slugToUuid(requesteeSlug);
  const accountUid = req.session.accountUid;
  //no status sent
  if (!status) {
    res.status(404).json({ error: "status required" });
  }
  //invalid slug
  if (!requesterUid || !requesterUid) {
    res.status(400).json({ error: "invalid id slug" });
    return;
  }
  //trying to access swap user is not a part of
  if (requesterUid !== accountUid && requesteeUid !== accountUid) {
    res.sendStatus(accountUid ? 403 : 401);
    return;
  }
  const reverse = camelize(
    await pool.query(
      `SELECT * FROM swap 
    WHERE (requester_uid=$1 AND requestee_uid=$2)`,
      [requesteeUid, requesterUid]
    )
  ).rows[0];
  if (reverse) {
    res.status(409).json({
      error: "swap exists in reverse direction",
      link: `/api/v1/swap/${requesteeSlug}/${requesterSlug}`,
    });
    return;
  }
  const swap = camelize(
    await pool.query(
      `SELECT * FROM swap 
      WHERE (requester_uid=$1 AND requestee_uid=$2)`,
      [requesterUid, requesteeUid]
    )
  ).rows[0];
  if (status === "pending") {
    if (swap) {
      res.status(409).json({ error: "swap already exists" });
      return;
    }
    const newSwap = camelize(
      await pool.query(
        `INSERT INTO swap (requester_uid, requestee_uid)
        VALUES ($1, $2) 
        RETURNING 
          requester_uid, 
          requestee_uid,
          request_timestamp,
          accept_timestamp,
          end_timestamp,
          requester_rating,
          requestee_rating`,
        [requesterUid, requesteeUid]
      )
    ).rows[0];
    res.status(201).json(newSwap);
  } else if (status === "active") {
    if (!swap) {
      res.status(409).json({ error: "swap does not exists" });
      return;
    }
    if (requesterUid === accountUid) {
      res.status(401).json({ error: "can not accept own request" });
      return;
    }
    if (swap.acceptTimestamp) {
      res.status(409).json({ error: "swap has already been accepted" });
      return;
    }
    const newSwap = camelize(
      await pool.query(
        `UPDATE swap 
        SET accept_timestamp=now() 
        WHERE requester_uid=$1 AND requestee_uid=$2 
        RETURNING 
          requester_uid, 
          requestee_uid,
          request_timestamp,
          accept_timestamp,
          end_timestamp,
          requester_rating,
          requestee_rating`,
        [requesterUid, requesteeUid]
      )
    ).rows[0];
    res.status(200).json(newSwap);
  } else if (status === "ended") {
    if (!swap) {
      res.status(409).json({ error: "swap does not exist" });
      return;
    }
    if (swap.endTimestamp) {
      res.status(409).json({ error: "swap has already been ended" });
      return;
    }
    const rating = req.body.rating;
    const error = {};
    const newSwap = camelize(
      await pool.query(
        `UPDATE swap 
        SET end_timestamp=now(), 
        ${
          accountUid === requesterUid ? "requestee_rating" : "requester_rating"
        }=$1 
        WHERE requester_uid=$2 AND requestee_uid=$3 
        RETURNING 
          requester_uid, 
          requestee_uid,
          request_timestamp,
          accept_timestamp,
          end_timestamp,
          requester_rating,
          requestee_rating`,
        [rating, requesterUid, requesteeUid]
      )
    ).rows[0];
    res.status(200).json(newSwap);
  }
});

router.post("/:requesterSlug/:requesteeSlug/rating", async (req, res) => {
  const { requesterSlug, requesteeSlug } = req.params;
  const requesterUid = slugToUuid(requesterSlug);
  const requesteeUid = slugToUuid(requesteeSlug);
  const accountUid = req.session.accountUid;
  const rating = req.body.rating;
  //invalid slug
  if (!requesterUid || !requesterUid) {
    res.status(400).json({ error: "invalid id slug" });
    return;
  }
  //trying to access swap user is not a part of
  if (requesterUid !== accountUid && requesteeUid !== accountUid) {
    res.sendStatus(accountUid ? 403 : 401);
    return;
  }
  const error = {};
  validateRating(rating, error);
  if (error.invalidRating) {
    res.status(400).json({ error: "rating must be an integer from 1 to 5" });
    return;
  }
  const swap = camelize(
    await pool.query(
      `SELECT * FROM swap 
      WHERE (requester_uid=$1 AND requestee_uid=$2)`,
      [requesterUid, requesteeUid]
    )
  ).rows[0];
  if (!swap) {
    res.status(409).json({ error: "swap does not exists" });
    return;
  }
  if (!swap.endTimestamp) {
    res.status(409).json({ error: "swap not ended" });
    return;
  }
  //update swappers rating
  const query = camelize(
    await pool.query(
      `UPDATE account 
      SET avg_rating=(COALESCE(avg_rating*num_ratings, 0)+$1)/(num_ratings+1), 
      num_ratings=num_ratings+1
      WHERE account_uid=$2
      RETURNING avg_rating, num_ratings`,
      [rating, accountUid === requesterUid ? requesteeUid : requesterUid]
    )
  ).rows[0];
  res.status(200).json(query);
});

router.delete("/:requesterSlug/:requesteeSlug", async (req, res) => {
  const { requesterSlug, requesteeSlug } = req.params;
  const requesterUid = slugToUuid(requesterSlug);
  const requesteeUid = slugToUuid(requesteeSlug);
  const accountUid = req.session.accountUid;
  //invalid slug
  if (!requesterUid || !requesterUid) {
    res.status(400).json({ error: "invalid id slug" });
    return;
  }
  //trying to access swap user is not a part of
  if (requesterUid !== accountUid && requesteeUid !== accountUid) {
    res.sendStatus(accountUid ? 403 : 401);
    return;
  }
  //end_timestamp=null => swap can be pending or active but not ended
  const swap = camelize(
    await pool.query(
      `DELETE FROM swap 
        WHERE requester_uid=$1 AND requestee_uid=$2 AND end_timestamp IS NULL
        RETURNING *`,
      [requesterUid, requesteeUid]
    )
  ).rows[0];
  if (!swap) {
    const exists = camelize(
      await pool.query(
        `SELECT * FROM swap WHERE requester_uid=$1 AND requestee_uid=$2`,
        [requesterUid, requesteeUid]
      )
    ).rows[0];
    if (exists) {
      res
        .status(409)
        .json({ error: "swap must be pending or active to be deleted" });
      return;
    }
    res.status(404).json({ error: "no swap between specified accounts" });
    return;
  }
  res.sendStatus(204);
});

/**
//create swap in db
router.post("/request", checkAuth, async (req, res) => {
  const swapperName = req.body.swapperName;
  const accountUid = req.session.accountUid;
  if (!swapperName) {
    res.status(400).send("swapperName required");
    return;
  }
  try {
    const queryRes = (
      await pool.query(
        `INSERT INTO swap (account1_uid, account2_uid) SELECT $1, 
        account_uid FROM account WHERE username=$2 RETURNING account2_uid`,
        [accountUid, swapperName]
      )
    ).rows[0];
    if (!queryRes) {
      res.status(404).send(`${swapperName} not found`);
    } else {
      res.send(`sent swap request to ${swapperName}`);
    }
  } catch (e) {
    //UNIQUE error code => {account1_uid, account2_uid} pair already exists in swaps
    if (e.code == 23505) {
      res.status(409).send(`swap with ${swapperName} already exists`);
    }
    //CHECK error code => swapperName has same account_uid as client user
    else if (e.code == 23514) {
      res.status(400).send("cannot swap with yourself");
    }
  }
});

//add accept time
router.post("/accept", checkAuth, async (req, res) => {
  const swapperName = req.body.swapperName;
  const accountUid = req.session.accountUid;
  if (!swapperName) {
    res.status(400).send("swapperName required");
    return;
  }
  const queryRes = (
    await pool.query(
      `UPDATE swap SET accept_timestamp=now() FROM account WHERE 
    accept_timestamp IS NULL AND account.username=$1 AND swap.account1_uid=account.account_uid AND 
    swap.account2_uid=$2 RETURNING account.username`,
      [swapperName, accountUid]
    )
  ).rows[0];
  if (!queryRes) {
    res.status(400).send(`no pending swap request from ${swapperName}`);
  } else {
    res.send(`accepted swap request from ${swapperName}`);
  }
});

//remove swap in db
router.post("/reject", checkAuth, async (req, res) => {
  const swapperName = req.body.swapperName;
  const accountUid = req.session.accountUid;
  if (!swapperName) {
    res.status(400).send("swapperName required");
    return;
  }
  //uid1=requester, uid2=accepter
  const queryRes = (
    await pool.query(
      `DELETE FROM swap WHERE accept_timestamp IS NULL AND 
    swap.account1_uid IN (SELECT account_uid FROM account WHERE username=$1) AND swap.account2_uid=$2
    RETURNING account2_uid`,
      [swapperName, accountUid]
    )
  ).rows[0];
  if (!queryRes) {
    res.status(400).send(`no pending request from ${swapperName}`);
  } else {
    res.send(`rejected swap request from ${swapperName}`);
  }
});

//remove swap from db
router.post("/cancel", checkAuth, async (req, res) => {
  const swapperName = req.body.swapperName;
  const accountUid = req.session.accountUid;
  if (!swapperName) {
    res.status(400).send("swapperName required");
    return;
  }
  //uid1=requester, uid2=accepter
  const queryRes = (
    await pool.query(
      `DELETE FROM swap WHERE accept_timestamp IS NULL AND 
    swap.account2_uid IN (SELECT account_uid FROM account WHERE username=$1) AND swap.account1_uid=$2
    RETURNING account2_uid`,
      [swapperName, accountUid]
    )
  ).rows[0];
  if (!queryRes) {
    res.status(400).send(`no pending request sent to ${swapperName}`);
  } else {
    res.send(`cancelled swap request to ${swapperName}`);
  }
});

//add end time
router.post("/end", checkAuth, async (req, res) => {
  const swapperName = req.body.swapperName;
  const accountUid = req.session.accountUid;
  if (!swapperName) {
    res.status(400).send("swapperName required");
    return;
  }
  const queryRes = (
    await pool.query(
      `UPDATE swap SET end_timestamp=now() FROM account WHERE 
    accept_timestamp IS NOT NULL AND end_timestamp IS NULL AND account.username=$1 AND 
    ((swap.account1_uid=account.account_uid AND swap.account2_uid=$2) OR 
    (swap.account2_uid=account.account_uid AND swap.account1_uid=$2)) RETURNING account.username`,
      [swapperName, accountUid]
    )
  ).rows[0];
  if (!queryRes) {
    res.status(400).send(`no ongoing match with ${swapperName}`);
  } else {
    res.send(`ended swap with ${swapperName}`);
  }
});

//add rating
router.post("/rate", checkAuth, async (req, res) => {
  const { swapperName, rating } = req.body;
  const accountUid = req.session.accountUid;
  if (!swapperName) {
    res.status(400).send("swapperName required");
    return;
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    res.status(400).send("rating must be an integer between 0 and 5");
    return;
  }
  const account1Uid = camelize(
    await pool.query(
      `SELECT swap.account1_uid FROM swap JOIN account AS account1 ON 
    account1_uid=account1.account_uid JOIN account AS account2 ON account2_uid=account2.account_uid 
    WHERE (swap.account1_uid=$1 OR swap.account2_uid=$1) AND swap.accept_timestamp IS NOT NULL AND 
    swap.end_timestamp IS NOT NULL`,
      [accountUid]
    )
  ).rows[0].account1Uid;
  if (!account1Uid) {
    res.status(400).send(`no ended swap with ${swapperName}`);
    return;
  }
  //user is the first account in swap (requester)
  if (accountUid == account1Uid) {
    await pool.query(`UPDATE swap SET account2_rating=$1`, [rating]);
    res.send(`set rating to ${rating} for ${swapperName}`);
  } else {
    await pool.query(`UPDATE swap SET account1_rating=$1`, [rating]);
    res.send(`set rating to ${rating} for ${swapperName}`);
  }
});
*/
