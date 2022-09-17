import { validateUsername } from "../utils/dataValidation.js";
import { validateEmail } from "../utils/dataValidation.js";
import { validatePassword } from "../utils/dataValidation.js";
import { validateAddress } from "../utils/dataValidation.js";
export default async function validateRegistrationData(req, res, next) {
  const { username, email, password, address } = req.body;
  var error = {};
  await validateUsername(username, error);
  await validateEmail(email, error);
  validatePassword(password, error);
  validateAddress(address, error, true);
  //if any errors
  if (Object.keys(error).length) {
    res.status(400).json(error);
    return;
  }
  next();
}
