// Collection of functions to validate user input fields
/* 
Functions MUST return an object with structure: 
{
  error: Boolean, 
  msg: String
}

On success, return 
{
  error: false, 
  msg: "success"
}
*/

/**
 * For signup/login username field
 * @param {String} text 3 <= length <= 30
 */
export function validateUsername(text) {
  if (text.length === 0) {
    return {
      error: true,
      msg: "Username required",
    };
  }
  if (text.length < 3) {
    return {
      error: true,
      msg: "Username must be 3 or more characters long",
    };
  }
  if (text.length > 30) {
    return {
      error: true,
      msg: "Username too long",
    };
  }
  if (text.match(/[!*'();:@&=+$,/?%#[\]]/)) {
    return {
      error: true,
      msg: "Username contains illegal characters",
    };
  } else
    return {
      error: false,
      msg: "success",
    };
}

/**
 * For signup/login password field
 * @param {String} text 6 <= length <= 50, contains one lowercase, uppercase, digit
 */
export function validatePassword(text) {
  if (text.length === 0) {
    return {
      error: true,
      msg: "Password required",
    };
  }
  if (text.length < 6) {
    return {
      error: true,
      msg: "Password must be 6 or more characters long",
    };
  }
  if (text.length > 50) {
    return {
      error: true,
      msg: "Password too long",
    };
  }
  if (!text.match(/[A-Z]/) || !text.match(/[a-z]/) || !text.match(/\d/)) {
    return {
      error: true,
      msg: "Password must contain one lowercase letter, one uppercase letter, and one number",
    };
  } else
    return {
      error: false,
      msg: "success",
    };
}

/**
 * For signup confirm password field
 * @param {String} text Matches password
 */
export function validateMatching(text1, text2) {
  if (text1 === text2) {
    return {
      error: false,
      msg: "success",
    };
  } else
    return {
      error: true,
      msg: "",
    };
}

/**
 * For signup email field
 * @param {String} text Email regex: ^\S+@\S+$
 */
export function validateEmail(text) {
  if (text.length === 0) {
    return {
      error: true,
      msg: "Email required",
    };
  }
  if (!text.match(/^\S+@\S+$/)) {
    return {
      error: true,
      msg: "Invalid email format",
    };
  } else
    return {
      error: false,
      msg: "success",
    };
}

/**
 * For address lines 1, 2, 3 on signup form
 * @param {String} text address.length <= 80
 */
export function validateAddress(text) {
  if (text.length > 80) {
    return {
      error: true,
      msg: "Address too long",
    };
  } else
    return {
      error: false,
      msg: "success",
    };
}

/**
 * For city input on signup form
 * @param {String} text city.length <= 35
 */
export function validateCity(text) {
  if (text.length > 35) {
    return {
      error: true,
      msg: "City too long",
    };
  } else
    return {
      error: false,
      msg: "success",
    };
}

/**
 * For postal code input on signup form
 * @param {String} text Must match postal code regex
 */
export function validatePostalCode(text) {
  if (!text.match(/^([A-Z][0-9]){3}$/)) {
    return {
      error: true,
      msg: "Expected format: A1A1A1",
    };
  }
  if (!text.match(/^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/)) {
    return {
      error: true,
      msg: "Invalid Canadian postal code",
    };
  } else
    return {
      error: false,
      msg: "success",
    };
}

/**
 * Returns a false error object regardless of text
 * @param {String} text
 */
export function dummyValidation(text) {
  return {
    error: false,
    msg: "success",
  };
}

/**
 * For password (simplified)
 * @param {String} text Same requirements as validatePassword()
 */
export function dummyValidatePassword(text) {
  if (
    text.length === 0 ||
    text.length < 6 ||
    text.length > 50 ||
    !text.match(/[A-Z]/) ||
    !text.match(/[a-z]/) ||
    !text.match(/\d/)
  ) {
    return {
      error: true,
      msg: "",
    };
  } else
    return {
      error: false,
      msg: "success",
    };
}
