import slugid from "slugid";
/**
 * returns uuid if slug is valid, null otherwise
 */
export default function (slug) {
  const accountUid =
    /^[A-Za-z0-9_-]{8}[Q-T][A-Za-z0-9_-][CGKOSWaeimquy26-][A-Za-z0-9_-]{10}[AQgw]$/.test(
      slug
    )
      ? slugid.decode(slug)
      : null;
  return accountUid;
}
