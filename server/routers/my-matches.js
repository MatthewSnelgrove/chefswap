import express from "express";
import { pool } from "../dbConfig.js";
import camelize from "camelize";

export const router = express.Router();

/**
 * 
 */
router.get("/", checkAuth, async (req, res) => {
    res.send("TODO");
});