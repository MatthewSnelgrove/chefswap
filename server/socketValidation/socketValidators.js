import { formatSocketErrors, messageValidatorById } from "./ajvSetup.js";

export const validateDmMessageInput = (instance, event) => {
  const validator = messageValidatorById.get(event);
  const result = validator(instance);
  if (!result) {
    const formattedErrors = formatSocketErrors(validator.errors, event);
    console.log("socketErrors", formattedErrors);
    return formattedErrors;
  }
  return false;
};
