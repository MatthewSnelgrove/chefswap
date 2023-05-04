class ValidationError extends Error {
  constructor(errors) {
    super();
    this.errors = errors;
  }
}

export default (validationErrors, event) => {
  const errors = validationErrors.map((error) => ({
    code: "ERRINPUTVAL",
    event: event,
    message: `"${error.path}" is not valid`,
    detail: `${error.path} = ${JSON.stringify(error.instance)} ${
      error.message
    }`,
  }));
  return new ValidationError(errors);
};
