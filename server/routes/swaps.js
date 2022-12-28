import express from "express";
import { pool } from "../configServices/dbConfig.js";
import camelize from "camelize";
import slugToUuid from "../utils/slugToUuid.js";
import { validateRating } from "../utils/dataValidation.js";
import uuid4 from "uuid4";
import checkAuth from "../middlewares/checkAuth.js";
import { accountNotFound, swapNotFound } from "../utils/errors.js";
import stripNulls from "../utils/stripNulls.js";
import { format } from "path";

export const router = express.Router();

//get info about swap
router.get("/:accountUid", checkAuth, async (req, res, next) => {
  const accountUid = req.params.accountUid;
  const {
    status,
    orderBy,
    limit = 20,
    key = {
      swapperUid: "00000000-0000-0000-0000-000000000000",
    },
  } = req.query;
  if (
    key.time &&
    (!orderBy || (orderBy != "timeAsc" && orderBy != "timeDesc"))
  ) {
    //cannot paginate by time if not ordered by time
    next({
      status: 400,
      message: "invalid query params",
      detail: `query param orderBy must equal 'timeAsc' or 'timeDesc' to paginate by time`,
    });
    return;
  }
  const swaps = camelize(
    await pool.query(`SELECT * FROM get_swaps($1, $2, $3, $4, $5, $6)`, [
      accountUid,
      status,
      orderBy,
      key.swapperUid,
      key.time,
      limit,
    ])
  ).rows;
  for (const swap of swaps) {
    formatSwap(swap);
  }
  console.log(swaps);
  res.status(200).json(swaps);
  return;
});

//create new swap
router.post("/:accountUid", checkAuth, async (req, res, next) => {
  const requesterUid = req.params.accountUid;
  const requesteeUid = req.body.requesteeUid;
  const newSwapRes = camelize(
    await pool
      .query(
        `INSERT INTO swap (requester_uid, requestee_uid, request_timestamp)
        VALUES ($1, $2, NOW()) 
        RETURNING 
          requester_uid, 
          requestee_uid,
          request_timestamp,
          accept_timestamp,
          end_timestamp`,
        [requesterUid, requesteeUid]
      )
      .catch((e) => {
        console.log(e);
        switch (e.constraint) {
          //should only happen if identical req sent multiple times because of some network quirk
          case "swap_pkey":
            next({
              status: 409,
              message: "invalid swap",
              detail: "swap already exists",
            });
            return;
          //same requester/requestee uids. can't swap with yourself
          case "swap_check":
            next({
              status: 400,
              message: "invalid swap",
              detail: "you cannot swap with yourself",
            });
          //catch all normal existing swaps
          case "swap_end_timestamp_lo_uid_hi_uid_key":
            next({
              status: 409,
              message: "invalid swap",
              detail: "cannot have multiple ongoing swaps with same user",
            });
            return;
          //should not happen
          default:
            console.log(e.constraint);
            next({});
            return;
        }
      })
  );
  const newSwap = newSwapRes ? newSwapRes.rows[0] : null;
  if (newSwap) {
    formatSwap(newSwap);
    res.status(201).json(newSwap);
  }
});

router.get(
  "/:accountUid/:swapperUid/:requestTimestamp",
  checkAuth,
  async (req, res, next) => {
    const { accountUid, swapperUid, requestTimestamp } = req.params;
    const swap = camelize(
      await pool.query(
        `SELECT * FROM get_single_swap($1, $2, $3)
      `,
        [accountUid, swapperUid, requestTimestamp]
      )
    ).rows[0];
    //no results can mean no swaps for account, or account does not exist
    if (!swap) {
      const swapperExists = camelize(
        await pool.query(
          `SELECT account_uid FROM account WHERE account_uid=$1`,
          [swapperUid]
        )
      ).rows[0];
      if (!swapperExists) {
        res.next(accountNotFound);
        return;
      }
      next(swapNotFound);
      return;
    }
    formatSwap(swap);
    res.status(200).json(swap);
    return;
  }
);

router.delete(
  "/:accountUid/:swapperUid/:requestTimestamp",
  checkAuth,
  async (req, res, next) => {
    const { accountUid, swapperUid, requestTimestamp } = req.params;
    const swap = camelize(
      await pool.query(
        `DELETE FROM swap 
      WHERE ((swap.requester_uid=$1 AND swap.requestee_uid=$2) 
             OR (swap.requester_uid=$2 AND swap.requestee_uid=$1)
            ) AND request_timestamp=$3
            RETURNING *
      `,
        [accountUid, swapperUid, requestTimestamp]
      )
    ).rows[0];
    //swap doesn't exist
    if (!swap) {
      next(swapNotFound);
      return;
    }
    //swap successfully deleted
    res.sendStatus(204);
  }
);

router.put(
  "/:accountUid/:swapperUid/:requestTimestamp/status",
  checkAuth,
  async (req, res, next) => {
    const { accountUid, swapperUid, requestTimestamp } = req.params;
    const status = req.body.status;
    let field;
    switch (status) {
      case "ongoing":
        field = "accept_timestamp";
        break;
      case "ended":
        field = "end_timestamp";
        break;
      default:
        next({
          status: 400,
          message: "invalid status",
          detail: "status must be 'ongoing' or 'ended'",
        });
        return;
    }
    let err = false;
    await pool.query("BEGIN");
    const swapQuery = camelize(
      await pool
        .query(
          `UPDATE swap
          SET ${field}=NOW()
          WHERE ((swap.requester_uid=$1 AND swap.requestee_uid=$2) 
                 OR (swap.requester_uid=$2 AND swap.requestee_uid=$1)
                ) AND request_timestamp=$3
                RETURNING requester_uid, requestee_uid, request_timestamp, accept_timestamp, end_timestamp`,
          [accountUid, swapperUid, requestTimestamp]
        )
        .catch((e) => {
          err = true;
          switch (e.message) {
            case "accept_timestamp is immutable":
              next({
                status: 409,
                message: "swap already accepted",
                detail:
                  "specified swap has already been accepted (possibly ended)",
              });
              return;
            case "end_timestamp is immutable":
              next({
                status: 409,
                message: "swap already ended",
                detail: "specified swap has already been ended",
              });
              return;
            case "end_timestamp requires non-null accept_timestamp":
              next({
                status: 409,
                message: "swap not accepted",
                detail:
                  "specified swap has not been accepted and cannot be ended",
              });
              return;
            default:
              console.log(e);
              next({});
              return;
          }
        })
    );
    //error in query - return
    if (err) {
      return;
    }
    const swap = swapQuery.rows[0];
    //swap doesn't exist
    if (!swap) {
      next(swapNotFound);
      return;
    }
    console.log(swap);
    //trying to accept own swap
    if (swap.requesterUid === accountUid && status === "ongoing") {
      await pool.query(`ABORT`);
      next({
        status: 409,
        message: "cannot accept own swap",
        detail: "cannot accept own swap",
      });
      return;
    }
    await pool.query("COMMIT");
    formatSwap(swap);
    //swap successfully updated
    res.json(swap);
  }
);

// router.post("/:accountUid/:swapperUid", async (req, res) => {
//   const { requesterSlug, requesteeSlug } = req.params;
//   const status = req.body.status;
//   const requesterUid = slugToUuid(requesterSlug);
//   const requesteeUid = slugToUuid(requesteeSlug);
//   const accountUid = req.session.accountUid;
//   //no status sent
//   if (!status) {
//     res.status(404).json({ error: "status required" });
//   }
//   //invalid slug
//   if (!requesterUid || !requesterUid) {
//     res.status(400).json({ error: "invalid id slug" });
//     return;
//   }
//   //trying to access swap user is not a part of
//   if (requesterUid !== accountUid && requesteeUid !== accountUid) {
//     res.sendStatus(accountUid ? 403 : 401);
//     return;
//   }
//   const reverse = camelize(
//     await pool.query(
//       `SELECT * FROM swap
//     WHERE (requester_uid=$1 AND requestee_uid=$2)`,
//       [requesteeUid, requesterUid]
//     )
//   ).rows[0];
//   if (reverse) {
//     res.status(409).json({
//       error: "swap exists in reverse direction",
//       link: `/api/v1/swap/${requesteeSlug}/${requesterSlug}`,
//     });
//     return;
//   }
//   const swap = camelize(
//     await pool.query(
//       `SELECT * FROM swap
//       WHERE (requester_uid=$1 AND requestee_uid=$2)`,
//       [requesterUid, requesteeUid]
//     )
//   ).rows[0];
//   if (status === "pending") {
//     if (swap) {
//       res.status(409).json({ error: "swap already exists" });
//       return;
//     }
//     const newSwap = camelize(
//       await pool.query(
//         `INSERT INTO swap (requester_uid, requestee_uid)
//         VALUES ($1, $2)
//         RETURNING
//           requester_uid,
//           requestee_uid,
//           request_timestamp,
//           accept_timestamp,
//           end_timestamp,
//           requester_rating,
//           requestee_rating`,
//         [requesterUid, requesteeUid]
//       )
//     ).rows[0];
//     res.status(201).json(newSwap);
//   } else if (status === "active") {
//     if (!swap) {
//       res.status(409).json({ error: "swap does not exists" });
//       return;
//     }
//     if (requesterUid === accountUid) {
//       res.status(401).json({ error: "can not accept own request" });
//       return;
//     }
//     if (swap.acceptTimestamp) {
//       res.status(409).json({ error: "swap has already been accepted" });
//       return;
//     }
//     const newSwap = camelize(
//       await pool.query(
//         `UPDATE swap
//         SET accept_timestamp=now()
//         WHERE requester_uid=$1 AND requestee_uid=$2
//         RETURNING
//           requester_uid,
//           requestee_uid,
//           request_timestamp,
//           accept_timestamp,
//           end_timestamp,
//           requester_rating,
//           requestee_rating`,
//         [requesterUid, requesteeUid]
//       )
//     ).rows[0];
//     res.status(200).json(newSwap);
//   } else if (status === "ended") {
//     if (!swap) {
//       res.status(409).json({ error: "swap does not exist" });
//       return;
//     }
//     if (swap.endTimestamp) {
//       res.status(409).json({ error: "swap has already been ended" });
//       return;
//     }
//     const rating = req.body.rating;
//     const error = {};
//     const newSwap = camelize(
//       await pool.query(
//         `UPDATE swap
//         SET end_timestamp=now(),
//         ${
//           accountUid === requesterUid ? "requestee_rating" : "requester_rating"
//         }=$1
//         WHERE requester_uid=$2 AND requestee_uid=$3
//         RETURNING
//           requester_uid,
//           requestee_uid,
//           request_timestamp,
//           accept_timestamp,
//           end_timestamp,
//           requester_rating,
//           requestee_rating`,
//         [rating, requesterUid, requesteeUid]
//       )
//     ).rows[0];
//     res.status(200).json(newSwap);
//   }
// });

// router.post("/:requesterSlug/:requesteeSlug/rating", async (req, res) => {
//   const { requesterSlug, requesteeSlug } = req.params;
//   const requesterUid = slugToUuid(requesterSlug);
//   const requesteeUid = slugToUuid(requesteeSlug);
//   const accountUid = req.session.accountUid;
//   const rating = req.body.rating;
//   //invalid slug
//   if (!requesterUid || !requesterUid) {
//     res.status(400).json({ error: "invalid id slug" });
//     return;
//   }
//   //trying to access swap user is not a part of
//   if (requesterUid !== accountUid && requesteeUid !== accountUid) {
//     res.sendStatus(accountUid ? 403 : 401);
//     return;
//   }
//   const error = {};
//   validateRating(rating, error);
//   if (error.invalidRating) {
//     res.status(400).json({ error: "rating must be an integer from 1 to 5" });
//     return;
//   }
//   const swap = camelize(
//     await pool.query(
//       `SELECT * FROM swap
//       WHERE (requester_uid=$1 AND requestee_uid=$2)`,
//       [requesterUid, requesteeUid]
//     )
//   ).rows[0];
//   if (!swap) {
//     res.status(409).json({ error: "swap does not exists" });
//     return;
//   }
//   if (!swap.endTimestamp) {
//     res.status(409).json({ error: "swap not ended" });
//     return;
//   }
//   //update swappers rating
//   const query = camelize(
//     await pool.query(
//       `UPDATE account
//       SET avg_rating=(COALESCE(avg_rating*num_ratings, 0)+$1)/(num_ratings+1),
//       num_ratings=num_ratings+1
//       WHERE account_uid=$2
//       RETURNING avg_rating, num_ratings`,
//       [rating, accountUid === requesterUid ? requesteeUid : requesterUid]
//     )
//   ).rows[0];
//   res.status(200).json(query);
// });

// router.delete("/:requesterSlug/:requesteeSlug", async (req, res) => {
//   const { requesterSlug, requesteeSlug } = req.params;
//   const requesterUid = slugToUuid(requesterSlug);
//   const requesteeUid = slugToUuid(requesteeSlug);
//   const accountUid = req.session.accountUid;
//   //invalid slug
//   if (!requesterUid || !requesterUid) {
//     res.status(400).json({ error: "invalid id slug" });
//     return;
//   }
//   //trying to access swap user is not a part of
//   if (requesterUid !== accountUid && requesteeUid !== accountUid) {
//     res.sendStatus(accountUid ? 403 : 401);
//     return;
//   }
//   //end_timestamp=null => swap can be pending or active but not ended
//   const swap = camelize(
//     await pool.query(
//       `DELETE FROM swap
//         WHERE requester_uid=$1 AND requestee_uid=$2 AND end_timestamp IS NULL
//         RETURNING *`,
//       [requesterUid, requesteeUid]
//     )
//   ).rows[0];
//   if (!swap) {
//     const exists = camelize(
//       await pool.query(
//         `SELECT * FROM swap WHERE requester_uid=$1 AND requestee_uid=$2`,
//         [requesterUid, requesteeUid]
//       )
//     ).rows[0];
//     if (exists) {
//       res
//         .status(409)
//         .json({ error: "swap must be pending or active to be deleted" });
//       return;
//     }
//     res.status(404).json({ error: "no swap between specified accounts" });
//     return;
//   }
//   res.sendStatus(204);
// });

/**
 * strips null fields and adds status field to swap
 * @param {Object} swap swap to format
 */
function formatSwap(swap) {
  //remove all null fields
  stripNulls(swap, ["acceptTimestamp", "endTimestamp"]);
  //add status field
  if (swap.endTimestamp) {
    swap.status = "ended";
  } else if (swap.acceptTimestamp) {
    swap.status = "ongoing";
  } else {
    swap.status = "pending";
  }
}
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
