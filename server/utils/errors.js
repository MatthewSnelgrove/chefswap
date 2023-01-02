export const accountNotFound = {
  status: 404,
  message: "account not found",
  detail: "account with specified accountUid not found",
};

export const sessionNotFound = {
  status: 404,
  message: "session not found",
  detail: "no active session",
};

export const forbidden = {
  status: 403,
  message: "not authenticated with targeted account",
  detail: "this action requires authentication with targeted account",
};

export const unauthorized = {
  status: 401,
  message: "not authenticated",
  detail: "this action requires authentication with targeted account",
};

export const swapNotFound = {
  status: 404,
  message: "swap not found",
  detail: "specified swap does not exist",
};

export const ratingNotFound = {
  status: 404,
  message: "rating not found",
  detail: "rating with specified accountUid and swapperUid not found",
};
