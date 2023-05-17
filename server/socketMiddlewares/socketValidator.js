import { Parser, fromFile } from "@asyncapi/parser";
import Ajv, { KeywordCxt } from "ajv";
import addFormats from "ajv-formats";
import ajvKeywords from "ajv-keywords";
import { betterAjvErrors } from "@apideck/better-ajv-errors";
import {
  addReadOnlyKeyword,
  addRequiredKeyword,
} from "../socketValidation/ajvKeywords.js";

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
const { document } = await fromFile(parser, "./server/socketdoc.yaml").parse();

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
      const ackValidator = readAjv.compile(message.x - ack.args || {});
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
      const ackValidator = writeAjv.compile(message.x - ack.args || {});
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

export function validateMessageByEvent([event, instance], next) {
  const validator = writeMessageValidatorByEvent.get(event);
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
    next(formattedErrors);
    return;
  }
  next();
}
