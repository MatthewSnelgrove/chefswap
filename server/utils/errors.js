export class BusinessError extends Error {
  constructor({ status, message, detail }) {
    super(message);
    this.status = status;
    this.message = message;
    this.detail = detail;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const accountNotFound = new BusinessError({
  status: 404,
  message: "account not found",
  detail: "account with specified accountUid not found",
});

export const swapperNotFound = new BusinessError({
  status: 404,
  message: "swapper not found",
  detail: "swapper with specified swapperUid not found",
});

export const sessionNotFound = new BusinessError({
  status: 404,
  message: "session not found",
  detail: "no active session",
});

export const forbidden = new BusinessError({
  status: 403,
  message: "not authenticated with targeted account",
  detail: "this action requires authentication with targeted account",
});

export const unauthorized = new BusinessError({
  status: 401,
  message: "not authenticated",
  detail: "this action requires authentication with targeted account",
});

export const invalidLogin = new BusinessError({
  status: 401,
  message: "invalid login credentials",
  detail: "the username or password entered is incorrect",
});

export const swapNotFound = new BusinessError({
  status: 404,
  message: "swap not found",
  detail: "specified swap does not exist",
});

export const ratingNotFound = new BusinessError({
  status: 404,
  message: "rating not found",
  detail: "rating with specified accountUid and swapperUid not found",
});



