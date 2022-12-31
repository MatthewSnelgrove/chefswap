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

//create rating
router.put("/:accountUid/:swapperUid", async (req, res, next) => {
  const { accountUid, swapperUid } = req.params;
  const rating = camelize(
    await pool.query(
      `INSERT INTO rating (account_uid, swapper_uid, rating)
    VALUES($1, $2, $3)) 
    ON CONFLICT ON CONSTRAINT rating_pkey 
    DO UPDATE SET rating = $3`
    )
  );
  res.status(200).json(rating);
});
