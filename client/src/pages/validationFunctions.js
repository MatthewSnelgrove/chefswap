// Collection of functions to validate user input fields
// Functions MUST return an object with structure: {error: Boolean, msg: String}
// On success, return {error: false, msg: "success"}

/**
 * For signup/login username field
 * @param {String} text 3 <= length <= 30
 */
export function validateUsername(text) {
  console.log(text);
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
    }
  }
  if (text.match(/[!*'();:@&=+$,/?%#[\]]/)) {
    return {
      error: true,
      msg: "Username contains illegal characters",
    }
  }
  else return {
    error: false,
    msg: "success",
  };
}

/**
 * For signup/login password field
 * @param {String} text 6 <= length <= 50, contains one lowercase, uppercase, digit
 */
export function validatePassword(text) {
  if (text.length < 6) {
    return {
      error: true,
      msg: "Password must be 6 or more characters long",
    }
  }
  if (text.length > 50) {
    return {
      error: true,
      msg: "Password too long",
    }
  }
  if (!text.match(/[A-Z]/) || !text.match(/[a-z]/) || !text.match(/\d/)) {
    return {
      error: true,
      msg: "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    }
  }
  else return {
    error: false,
    msg: "success",
  }
}
