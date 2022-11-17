import slugToUuid from "../utils/slugToUuid.js";
export default function checkAuth(req, res, next) {
  const accountUid = req.params.accountUid;
  if (accountUid !== req.session.accountUid) {
    if (req.session.accountUid) {
      next({
        status: 403,
        message: "not authenticated with targeted account",
        detail: "this action requires authentication with targeted account",
      });
      return;
    }
    next({
      status: 401,
      message: "not authenticated",
      detail: "this action requires authentication with targeted account",
    });
    return;
  }
  next();
}
