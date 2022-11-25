/**
 * Remove properties from JSON strictly if they null (not just falsy).
 * @param {Object} obj obj to strip nulls from
 * @param {Array} [fields=null] properties to strip if null
 */
export default function (obj, fields = null) {
  for (const field of fields || Object.keys(obj)) {
    if (obj[field] === null) {
      delete obj[field];
    }
  }
}
