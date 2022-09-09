import { pool } from "../dbConfig.js";
export async function validateUsername(username, error){
    if(!username || username.length > 30){
        error.invalidUsername = true;
    }
    const usernameTaken = await pool.query("SELECT username FROM account WHERE username=$1",[username]);
    if(usernameTaken.rowCount > 0){
        error.usernameTaken = true;
    }
}
export async function validateEmail(email, error){
    if(!email || email.length > 80 || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
        error.invalidEmail = true;
    }
    const emailTaken = await pool.query("SELECT email FROM account WHERE email=$1", [email]);
    if(emailTaken.rowCount > 0){
        error.emailTaken = true;
    }
}
export function validatePassword(password, error){
    if(!password || password.length > 50){
        error.invalidPassword = true;
     }
}
//if strict, address must set values for all non-null fields (address1, city, province postalCode)
export function validateAddress(address, error, strict){
    const { address1, address2, address3, city, province, postalCode } = address;
    //for non-null fieds, if req has field => validate value, else => check if strict mode
    if(address1 ? address1.length > 80 : strict){
        error.invalidAddress1 = true;
    }
    if(address2 && address2.length > 80){
        error.invalidAddress2 = true;
    }
    if(address3 && address3.length > 80){
        error.invalidAddress3 = true;
    }
    if(city ? city.length > 35 : strict){
        error.invalidCity = true;
    }
    const provinces = ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan",
    "Nova Scotia", "New Brusnwick", "Newfoundland and Labrador", "Prince Edward Island",
    "Northwest Territories", "Yukon", "Nunavut"];
    if(province ? !provinces.includes(province) : strict){
        error.invalidProvince = true;
    }
    if(postalCode ? !/^([A-Z][0-9]){3}$/.test(postalCode) : strict){
        error.invalidPostalCode = true;
    }
}
export function validateBio(bio, error){
    if(!bio || bio.length > 500){
        error.invalidBio = true;
    }
}