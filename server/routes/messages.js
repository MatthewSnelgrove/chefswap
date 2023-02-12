// import express from "express";
// import { pool } from "../configServices/dbConfig.js";
// import camelize from "camelize";
// import checkAuth from "../middlewares/checkAuth.js";
// import { accountNotFound, swapNotFound } from "../utils/errors.js";
// import stripNulls from "../utils/stripNulls.js";

// export const router = express.Router();

// //get info about swap
// router.get("/:accountUid", checkAuth, async (req, res, next) => {
//   const accountUid = req.params.accountUid;
//   const {
//     status,
//     orderBy,
//     limit = 20,
//     key = {
//       swapperUid: "00000000-0000-0000-0000-000000000000",
//     },
//   } = req.query;
//   if (
//     key.time &&
//     (!orderBy || (orderBy != "timeAsc" && orderBy != "timeDesc"))
//   ) {
//     //cannot paginate by time if not ordered by time
//     next({
//       status: 400,
//       message: "invalid query params",
//       detail: `query param orderBy must equal 'timeAsc' or 'timeDesc' to paginate by time`,
//     });
//     return;
//   }
//   const swaps = camelize(
//     await pool.query(`SELECT * FROM get_swaps($1, $2, $3, $4, $5, $6)`, [
//       accountUid,
//       status,
//       orderBy,
//       key.swapperUid,
//       key.time,
//       limit,
//     ])
//   ).rows;
//   for (const swap of swaps) {
//     formatSwap(swap);
//   }
//   console.log(swaps);
//   res.status(200).json(swaps);
//   return;
// });

// //create new swap
// router.post("/:accountUid", checkAuth, async (req, res, next) => {
//   const requesterUid = req.params.accountUid;
//   const requesteeUid = req.body.requesteeUid;
//   const newSwapRes = camelize(
//     await pool
//       .query(
//         `INSERT INTO swap (requester_uid, requestee_uid, request_timestamp)
//         VALUES ($1, $2, NOW())
//         RETURNING
//           requester_uid,
//           requestee_uid,
//           request_timestamp,
//           accept_timestamp,
//           end_timestamp`,
//         [requesterUid, requesteeUid]
//       )
//       .catch((e) => {
//         console.log(e);
//         switch (e.constraint) {
//           //should only happen if identical req sent multiple times because of some network quirk
//           case "swap_pkey":
//             next({
//               status: 409,
//               message: "invalid swap",
//               detail: "swap already exists",
//             });
//             return;
//           //same requester/requestee uids. can't swap with yourself
//           case "swap_check":
//             next({
//               status: 400,
//               message: "invalid swap",
//               detail: "you cannot swap with yourself",
//             });
//           //catch all normal existing swaps
//           case "swap_end_timestamp_lo_uid_hi_uid_key":
//             next({
//               status: 409,
//               message: "invalid swap",
//               detail: "cannot have multiple ongoing swaps with same user",
//             });
//             return;
//           //should not happen
//           default:
//             console.log(e.constraint);
//             next({});
//             return;
//         }
//       })
//   );
//   const newSwap = newSwapRes ? newSwapRes.rows[0] : null;
//   if (newSwap) {
//     formatSwap(newSwap);
//     res.status(201).json(newSwap);
//   }
// });

// router.get(
//   "/:accountUid/:swapperUid/:requestTimestamp",
//   checkAuth,
//   async (req, res, next) => {
//     const { accountUid, swapperUid, requestTimestamp } = req.params;
//     const swap = camelize(
//       await pool.query(
//         `SELECT * FROM get_single_swap($1, $2, $3)
//       `,
//         [accountUid, swapperUid, requestTimestamp]
//       )
//     ).rows[0];
//     //no results can mean no swaps for account, or account does not exist
//     if (!swap) {
//       const swapperExists = camelize(
//         await pool.query(
//           `SELECT account_uid FROM account WHERE account_uid=$1`,
//           [swapperUid]
//         )
//       ).rows[0];
//       if (!swapperExists) {
//         res.next(accountNotFound);
//         return;
//       }
//       next(swapNotFound);
//       return;
//     }
//     formatSwap(swap);
//     res.status(200).json(swap);
//     return;
//   }
// );

// router.delete(
//   "/:accountUid/:swapperUid/:requestTimestamp",
//   checkAuth,
//   async (req, res, next) => {
//     const { accountUid, swapperUid, requestTimestamp } = req.params;
//     const swap = camelize(
//       await pool.query(
//         `DELETE FROM swap
//       WHERE ((swap.requester_uid=$1 AND swap.requestee_uid=$2)
//              OR (swap.requester_uid=$2 AND swap.requestee_uid=$1)
//             ) AND request_timestamp=$3
//             RETURNING *
//       `,
//         [accountUid, swapperUid, requestTimestamp]
//       )
//     ).rows[0];
//     //swap doesn't exist
//     if (!swap) {
//       next(swapNotFound);
//       return;
//     }
//     //swap successfully deleted
//     res.sendStatus(204);
//   }
// );

// router.put(
//   "/:accountUid/:swapperUid/:requestTimestamp/status",
//   checkAuth,
//   async (req, res, next) => {
//     const { accountUid, swapperUid, requestTimestamp } = req.params;
//     const status = req.body.status;
//     let field;
//     switch (status) {
//       case "ongoing":
//         field = "accept_timestamp";
//         break;
//       case "ended":
//         field = "end_timestamp";
//         break;
//       default:
//         next({
//           status: 400,
//           message: "invalid status",
//           detail: "status must be 'ongoing' or 'ended'",
//         });
//         return;
//     }
//     let err = false;
//     await pool.query("BEGIN");
//     const swapQuery = camelize(
//       await pool
//         .query(
//           `UPDATE swap
//           SET ${field}=NOW()
//           WHERE ((swap.requester_uid=$1 AND swap.requestee_uid=$2)
//                  OR (swap.requester_uid=$2 AND swap.requestee_uid=$1)
//                 ) AND request_timestamp=$3
//                 RETURNING requester_uid, requestee_uid, request_timestamp, accept_timestamp, end_timestamp`,
//           [accountUid, swapperUid, requestTimestamp]
//         )
//         .catch((e) => {
//           err = true;
//           switch (e.message) {
//             case "accept_timestamp is immutable":
//               next({
//                 status: 409,
//                 message: "swap already accepted",
//                 detail:
//                   "specified swap has already been accepted (possibly ended)",
//               });
//               return;
//             case "end_timestamp is immutable":
//               next({
//                 status: 409,
//                 message: "swap already ended",
//                 detail: "specified swap has already been ended",
//               });
//               return;
//             case "end_timestamp requires non-null accept_timestamp":
//               next({
//                 status: 409,
//                 message: "swap not accepted",
//                 detail:
//                   "specified swap has not been accepted and cannot be ended",
//               });
//               return;
//             default:
//               console.log(e);
//               next({});
//               return;
//           }
//         })
//     );
//     //error in query - return
//     if (err) {
//       return;
//     }
//     const swap = swapQuery.rows[0];
//     //swap doesn't exist
//     if (!swap) {
//       next(swapNotFound);
//       return;
//     }
//     console.log(swap);
//     //trying to accept own swap
//     if (swap.requesterUid === accountUid && status === "ongoing") {
//       await pool.query(`ABORT`);
//       next({
//         status: 409,
//         message: "cannot accept own swap",
//         detail: "cannot accept own swap",
//       });
//       return;
//     }
//     await pool.query("COMMIT");
//     formatSwap(swap);
//     //swap successfully updated
//     res.json(swap);
//   }
// );
