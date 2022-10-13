import slugToUuid from "../utils/slugToUuid.js";
export default function checkAuth(req, res, next) {
  const accountUid = req.params.accountUid;
  if (accountUid !== req.session.accountUid) {
    if (req.session.accountUid) {
      next({
        staus: 403,
        message: "not authenticated with targeted account",
        detail: "this action requires authentication with targeted account",
      });
      return;
    }
    next({
      staus: 401,
      message: "not authenticated",
      detail: "this action requires authentication with targeted account",
    });
    return;
  }
  next();
}
