import { pool } from "../configServices/dbConfig.js";
import validator from "validator";
export async function validateUsername(username, error) {
  if (!username || username.length > 30) {
    error.invalidUsername = true;
  }
  const usernameTaken = await pool.query(
    "SELECT username FROM account WHERE username=$1",
    [username]
  );
  if (usernameTaken.rowCount > 0) {
    error.usernameTaken = true;
  }
}
export async function validateEmail(email, error) {
  if (!email || email.length > 80 || !validator.isEmail(email)) {
    error.invalidEmail = true;
  }
  const emailTaken = await pool.query(
    "SELECT email FROM account WHERE email=$1",
    [email]
  );
  if (emailTaken.rowCount > 0) {
    error.emailTaken = true;
  }
}
export function validatePassword(password, error) {
  if (!password || password.length > 50) {
    error.invalidPassword = true;
  }
}
export function validateAddress1(address1, error) {
  if (!address1 || address1.length > 80) {
    error.invalidAddress1 = true;
  }
}
export function validateAddress2(address2, error) {
  if (address2 && address2.length > 80) {
    error.invalidAddress2 = true;
  }
}
export function validateAddress3(address3, error) {
  if (address3 && address3.length > 80) {
    error.invalidAddress3 = true;
  }
}
export function validateCity(city, error) {
  if (!city || city.length > 35) {
    error.invalidCity = true;
  }
}
export function validadteProvince(province, error) {
  const provinces = [
    "Ontario",
    "Quebec",
    "British Columbia",
    "Alberta",
    "Manitoba",
    "Saskatchewan",
    "Nova Scotia",
    "New Brusnwick",
    "Newfoundland and Labrador",
    "Prince Edward Island",
    "Northwest Territories",
    "Yukon",
    "Nunavut",
  ];
  if (!provinces.includes(province)) {
    error.invalidProvince = true;
  }
}
export function validadtePostalCode(postalCode, error) {
  if (!postalCode || !validator.isPostalCode(postalCode, "CA")) {
    error.invalidPostalCode = true;
  }
}
//if strict, address must set values for all non-null fields (address1, city, province postalCode)
export function validateAddress(address, error) {
  const { address1, address2, address3, city, province, postalCode } = address;
  //for non-null fieds, if req has field => validate value, else => check if strict mode
  validateAddress1(address1, error);
  validateAddress2(address2, error);
  validateAddress3(address3, error);
  validateCity(city, error);
  validadteProvince(province, error);
  validadtePostalCode(postalCode, error);
}
export function validateBio(bio, error) {
  if (!bio || bio.length > 500) {
    error.invalidBio = true;
  }
}
export function validateImageName(imageName, error) {
  if (!/(.png|.jpg|.jpeg)$/.test(imageName)) {
    error.invalidImageName = true;
  }
}
export function validateCircleRadius(circleRadius, error) {
  if (
    !circleRadius ||
    isNaN(circleRadius) ||
    circleRadius < 50 ||
    circleRadius > 3000
  ) {
    error.invalidRadius = true;
  }
}
