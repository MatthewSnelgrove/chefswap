import express, { json } from "express";
import { pool } from "../configServices/dbConfig.js";
import camelize from "camelize";
import checkAuth from "../middlewares/checkAuth.js";
export const router = express.Router();
import { swapperNotFound, ratingNotFound } from "../utils/errors.js";

router.get("/:accountUid/:swapperUid", checkAuth, async (req, res, next) => {
  const { accountUid, swapperUid } = req.params;
  const { rows } = camelize(
    await pool.query(
      `SELECT * FROM rating WHERE account_uid = $1 AND swapper_uid = $2`,
      [accountUid, swapperUid]
    )
  );
  if (rows[0]) {
    res.status(200).json(rows[0]);
    return;
  }
  next(ratingNotFound);
  return;
});

router.put("/:accountUid/:swapperUid", checkAuth, async (req, res, next) => {
  const { accountUid, swapperUid } = req.params;
  const { rating } = req.body;
  const { rows } = camelize(
    await pool
      .query(
        `INSERT INTO rating (account_uid, swapper_uid, rating, update_timestamp)
      VALUES ($1, $2, $3, NOW())
    ON CONFLICT ON CONSTRAINT rating_pkey 
      DO UPDATE SET (rating, update_timestamp)  = ($3, NOW())
      RETURNING *`,
        [accountUid, swapperUid, rating]
      )
      .catch((e) => {
        switch (e.constraint) {
          case "self_rate_check":
            next({
              status: 400,
              message: "Cannot rate self",
              detail: "accountUid and swapperUid cannot be the same",
            });
            return;
          case "rating_swapper_uid_fkey":
            next(swapperNotFound);
            return;
          default:
            //should not happen
            console.log(e);
            next({});
            return;
        }
      })
  ) || { rows: null };
  //db error
  if (!rows) {
    //won't do anything if self_rate_check caught. will return generic 500 otherwise
    next({});
    return;
  }
  res.status(200).json(rows[0]);
});
