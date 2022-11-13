import slugToUuid from "../utils/slugToUuid.js";
export default function checkAuth(req, res, next) {
  const slug = req.params.slug;
  const accountUid = slugToUuid(slug);
  //invalid slug
  if (!accountUid) {
    res.status(400).json({ error: "invalid id slug" });
    return;
  }
  if (accountUid !== req.session.accountUid) {
    res.sendStatus(req.session.accountUid ? 403 : 401);
    return;
  }
  next();
}
