import express, { json } from "express";
import { pool } from "../configServices/dbConfig.js";
import camelize from "camelize";
import checkAuth from "../middlewares/checkAuth.js";
export const router = express.Router();
import { ratingNotFound } from "../utils/errors.js";
import stripNulls from "../utils/stripNulls.js";

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
    await pool.query(
      `INSERT INTO rating (account_uid, swapper_uid, rating, update_timestamp)
      VALUES ($1, $2, $3, NOW())
    ON CONFLICT ON CONSTRAINT rating_pkey 
      DO UPDATE SET (rating, update_timestamp)  = ($3, NOW())
      RETURNING *`,
      [accountUid, swapperUid, rating]
    )
  );
  if (!rows[0]) {
    next({});
  }
  res.status(200).json(rows[0]);
});
