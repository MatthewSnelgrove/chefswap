export default (validationErrors, event) => {
  const errors = validationErrors.map((error) => ({
    code: "ERRINPUTVAL",
    event: event,
    message: `"${error.path}" is not valid`,
    detail: `${error.path} = ${JSON.stringify(error.instance)} ${
      error.message
    }`,
  }));
  return { errors: errors };
};
