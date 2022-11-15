import { forbidden, unauthorized } from "../utils/errors.js";
import slugToUuid from "../utils/slugToUuid.js";
export default function checkAuth(req, res, next) {
  const accountUid = req.params.accountUid;
  if (accountUid !== req.session.accountUid) {
    if (req.session.accountUid) {
      next(forbidden);
      return;
    }
    next(unauthorized);
    return;
  }
  next();
}
