class CustomError extends Error {
  constructor({ message, detail, status } = {}) {
    super(message);
    this.detail = detail;
    this.status = status;
  }
}
export class InvalidUsernameError extends CustomError {
  constructor() {
    super({
      code: "invalid-username",
      message: "Username is missing or invalid",
      detail: "Username is required and can be at most 30 characters",
    });
  }
}
export class UsernameTakenError extends CustomError {
  constructor() {
    super({
      code: "username-taken",
      message: "Requested username belongs to another user",
    });
  }
}
export class InvalidPasswordError extends CustomError {
  constructor() {
    super({
      code: "invalid-password",
      message: "Password is missing or invalid",
      detail: "Password is required and can be at most 50 characters",
    });
  }
}
export class NoAccountError extends CustomError {
  constructor() {
    super({
      message: "Account not found",
      detail: "Specified account does not exist",
      status: 400,
    });
  }
}
export class InvalidSlugError extends CustomError {
  constructor() {
    super({
      code: "invalid-slug",
      message: `Provided account slug is not valid`,
      detail: `Slug must be a base64url encoded uuid matching ^[A-Za-z0-9_-]{8}[Q-T][A-Za-z0-9_-][CGKOSWaeimquy26-][A-Za-z0-9_-]{10}[AQgw]$`,
    });
  }
}
export class MissingRequiredFieldError extends CustomError {
  constructor(field) {
    super({
      code: `missing-${field}`,
      message: `Missing required field ${field}`,
      detail: `Field ${field} must be included in the request body`,
    });
  }
}
