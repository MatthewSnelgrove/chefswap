import Validator from "jsonschema";
import validationErrorHandler from "./validationErrorHandler.js";
const validator = new Validator.Validator();
const schema = {
  type: "object",
  properties: {
    content: { type: "string" },
    receiverUid: { type: "string" },
  },
};
export default (instance, event) => {
  const errors = validator.validate(instance, schema).errors;
  if (errors.length > 0) {
    //return custom errors
    return validationErrorHandler(errors, event);
  }
  //extract only wanted properties
  return { content: instance.content, receiverUid: instance.receiverUid };
};
