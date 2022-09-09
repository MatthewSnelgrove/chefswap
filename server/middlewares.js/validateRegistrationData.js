import { pool } from "../dbConfig.js";
import { validateUsername } from "../utils/dataValidation.js";
import { validateEmail } from "../utils/dataValidation.js";
import { validatePassword } from "../utils/dataValidation.js";
import { validateAddress } from "../utils/dataValidation.js";
export default async function validateRegistrationData(req, res, next){
    const { username , email, password, address1, address2, address3, city, province, postalCode } = req.body;
    var error = {};
    await validateUsername(username, error);
    await validateEmail(email, error);
    validatePassword(password, error);
    const address = {
        address1: address1,
        address2: address2,
        address3: address3,
        city: city,
        province: province,
        postalCode: postalCode
    };
    validateAddress(address, error, true)
    //if any errors
    if(Object.keys(error).length){
        res.status(400).json(error);
        return;
    }
    next();
}