/**
 * Remove specified properties strictly if they null (not just falsy)
 * @param {Object} obj
 * @param {Array} fields
 */
export default function (obj, fields) {
  for (const field of fields) {
    if (obj[field] === null) {
      delete obj[field];
    }
  }
}
