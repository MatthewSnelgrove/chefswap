import { pool } from "../configServices/dbConfig.js";
import { accountNotFound, forbidden, unauthorized } from "../utils/errors.js";
export default async function checkAuth(req, res, next) {
  const accountUid = req.params.accountUid;
  if (accountUid !== req.session.accountUid) {
    const accExists = await pool.query(
      `SELECT account_uid FROM account WHERE account_uid = $1`,
      [accountUid]
    );
    if (!accExists.rows[0]) {
      next(accountNotFound);
      return;
    }
    if (req.session.accountUid) {
      next(forbidden);
      return;
    }
    next(unauthorized);
    return;
  }
  next();
}
