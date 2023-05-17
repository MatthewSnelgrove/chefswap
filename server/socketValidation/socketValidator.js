import { Parser, fromFile } from "@asyncapi/parser";
import Ajv, { KeywordCxt } from "ajv";
import addFormats from "ajv-formats";
import ajvKeywords from "ajv-keywords";
import { betterAjvErrors } from "@apideck/better-ajv-errors";
import { addReadOnlyKeyword, addRequiredKeyword } from "./ajvKeywords.js";

const ajvOptions = {
  allErrors: true,
  strict: false,
  unicodeRegExp: false,
};

//can add publishAjv for validating server messages
//may change names to reflect server callback being validated as write despite being for subscribe events

const publishAjv = new Ajv(ajvOptions);
addFormats(publishAjv);
addRequiredKeyword(publishAjv, "read");
addReadOnlyKeyword(publishAjv);

const parser = new Parser();
const { document } = await fromFile(parser, "./server/socketdoc.yaml").parse();

const schema = document._json;
export const messageValidatorByEvent = new Map();
Object.keys(schema.channels).forEach((channelName) => {
  //publish
  Object.keys(schema.channels[channelName].publish.message.oneOf).forEach(
    (messageIndex) => {
      const message =
        schema.channels[channelName].publish.message.oneOf[messageIndex];
      const validator = publishAjv.compile(message.payload || {});
      messageValidatorByEvent.set(message.messageId, validator);
    }
  );
  // no publish validation currently
  // subscribe
  // Object.keys(schema.channels[channelName].subscribe.message.oneOf).forEach(
  //   (messageIndex) => {
  //     const message =
  //       schema.channels[channelName].subscribe.message.oneOf[messageIndex];
  //     const validator = subscribeAjv.compile(message.payload || {});
  //     messageValidatorById.set(message.messageId, validator);
  //   }
  // );
});

function formatSocketErrors(ajvErrors, event) {
  // for each ajvError, push custom error to errors array
  const errors = ajvErrors.map((error) => {
    return {
      errorType: "validation",
      event: event,
      path: error.instancePath,
      message: `${error.keyword} error`,
      detail: error.message,
    };
  });

  return { errors: errors };
}

export function validateMessageByEvent([event, instance], next) {
  console.log("validateMessageByEvent", event, instance);
  const validator = messageValidatorByEvent.get(event);
  if (!validator) {
    const error = {
      errorType: "business",
      event: event,
      message: `event not found`,
      detail: `event ${event} was not found`,
    };
    next({ errors: [error] });
    return;
  }
  const result = validator(instance);
  if (!result) {
    const formattedErrors = formatSocketErrors(validator.errors, event);
    // console.log("socketErrors", formattedErrors);
    next(formattedErrors);
    return;
  }
  next();
}
