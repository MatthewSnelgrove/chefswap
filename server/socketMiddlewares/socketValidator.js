import { Parser, fromFile } from "@asyncapi/parser";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import {
  addReadOnlyKeyword,
  addRequiredKeyword,
} from "../utils/ajvKeywords.js";

const ajvOptions = {
  allErrors: true,
  strict: false,
  unicodeRegExp: false,
};

const writeAjv = new Ajv(ajvOptions);
addFormats(writeAjv);
addRequiredKeyword(writeAjv, "read");
addReadOnlyKeyword(writeAjv);

const readAjv = new Ajv(ajvOptions);
addFormats(readAjv);
addRequiredKeyword(readAjv, "write");
addReadOnlyKeyword(readAjv);

const parser = new Parser();
const { document } = await fromFile(parser, "./socketdoc.yaml").parse();

const schema = document._json;
export const payloadValidatorByEvent = new Map();
export const ackValidatorByEvent = new Map();
Object.keys(schema.channels).forEach((channelName) => {
  //publish
  Object.keys(schema.channels[channelName].publish.message.oneOf).forEach(
    (messageIndex) => {
      const message =
        schema.channels[channelName].publish.message.oneOf[messageIndex];
      const payloadValidator = writeAjv.compile(message.payload || {});
      payloadValidatorByEvent.set(message.messageId, payloadValidator);
      const ackValidator = readAjv.compile(message["x-ack.args"] || {});
      ackValidatorByEvent.set(message.messageId, ackValidator);
    }
  );
  //subscribe
  Object.keys(schema.channels[channelName].subscribe.message.oneOf).forEach(
    (messageIndex) => {
      const message =
        schema.channels[channelName].subscribe.message.oneOf[messageIndex];
      const payloadValidator = readAjv.compile(message.payload || {});
      payloadValidatorByEvent.set(message.messageId, payloadValidator);
      const ackValidator = writeAjv.compile(message["x-ack.args"] || {});
      ackValidatorByEvent.set(message.messageId, ackValidator);
    }
  );
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

function validateByValidator(validator, instance, next, callback) {
  const event = validator.schema["x-parser-schema-id"];
  if (!validator) {
    const error = {
      errorType: "business",
      event: event,
      message: `event not found`,
      detail: `event ${event} was not found`,
    };
    next([{ errors: [error] }, callback]);
    return;
  }
  const result = validator(instance);
  if (!result) {
    const formattedErrors = formatSocketErrors(validator.errors, event);
    next([formattedErrors, callback]);
    return;
  }
  next();
}

//for 1. validating user-created payload on publish events
//AND 2. validating server-created payload on subscribe events
export function validatePayloadByEvent([event, instance, callback], next) {
  const validator = payloadValidatorByEvent.get(event);
  validateByValidator(validator, instance, next, callback);
}
//ONLY for validating server-created ack on publish events
//user-created acks on subscribe events are not validated or won't exist
export function validateAckByEvent([event, instance, callback], next) {
  const validator = ackValidatorByEvent.get(event);
  validateByValidator(validator, instance, next, callback);
}
