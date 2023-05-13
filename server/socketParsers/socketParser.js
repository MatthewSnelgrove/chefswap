import { Parser, fromFile } from "@asyncapi/parser";
import Ajv, { KeywordCxt } from "ajv";
import addFormats from "ajv-formats";
import ajvKeywords from "ajv-keywords";
import { betterAjvErrors } from "@apideck/better-ajv-errors";
const parser = new Parser();
const { document, diagnostics } = await fromFile(
  parser,
  "./server/socketdoc.yaml"
).parse();
const schema = document._json;
const messageSchemaById = new Map();

Object.keys(schema.channels).forEach((channelName) => {
  //publish
  Object.keys(schema.channels[channelName].publish.message.oneOf).forEach(
    (messageIndex) => {
      const message =
        schema.channels[channelName].publish.message.oneOf[messageIndex];
      //make readOnly properties prohibited and not required for publish
      if (message.payload && message.payload.oneOf) {
        Object.keys(message.payload.oneOf).forEach((messagePayloadIndex) => {
          const messagePayload = message.payload.oneOf[messagePayloadIndex];
          modifySchemaForReadWriteOnly(messagePayload, "readOnly");
        });
      } else if (message.payload) {
        const messagePayload = message.payload;
        modifySchemaForReadWriteOnly(messagePayload, "readOnly");
      }
      messageSchemaById.set(message.messageId, message);
    }
  );
  //subscribe
  Object.keys(schema.channels[channelName].subscribe.message.oneOf).forEach(
    (messageIndex) => {
      const message =
        schema.channels[channelName].subscribe.message.oneOf[messageIndex];
      //make readOnly properties prohibited and not required for subscribe
      if (message.payload && message.payload.oneOf) {
        Object.keys(message.payload.oneOf).forEach((messagePayloadIndex) => {
          const messagePayload = message.payload.oneOf[messagePayloadIndex];
          modifySchemaForReadWriteOnly(messagePayload, "writeOnly");
        });
      } else if (message.payload) {
        const messagePayload = message.payload;
        modifySchemaForReadWriteOnly(messagePayload, "writeOnly");
      }
      messageSchemaById.set(message.messageId, message);
    }
  );
});

// /**
//  * Removes readOnly or writeOnly properties from schema and adds them to prohibited
//  * @function
//  * @param {import("@asyncapi/parser").AsyncAPISchema} schema
//  * @param {("readOnly"|"writeOnly")} property
//  * @returns {Array<string>} removed/prohibited properties
//  */
function modifySchemaForReadWriteOnly(schema, property) {
  // let removed = [];
  // if (!schema.properties) return removed;
  // Object.keys(schema.properties).forEach((propName) => {
  //   if (schema.properties[propName][property]) {
  //     //remove from required if present
  //     const propIndex = schema.required.indexOf(propName);
  //     if (propIndex !== -1) {
  //       schema.required.splice(propIndex, 1);
  //     }
  //     //add to prohibited
  //     if (!schema.prohibited) {
  //       schema.prohibited = [];
  //     }
  //     schema.prohibited.push(propName);
  //     //track removed properties
  //     removed.push(propName);
  //   }
  //   //call for nested schema
  //   removed.push(...modifySchemaForReadWriteOnly(schema.properties[propName]));
  // });
  // return removed;
}

const subscribeAjv = new Ajv({
  allErrors: true,
  strict: false,
  unicodeRegExp: false,
});
addFormats(subscribeAjv);
subscribeAjv.removeKeyword("required");
subscribeAjv.addKeyword("required", {
  schemaType: "array",
  compile(required, parentSchema, it) {
    const validate = (data, ctx) => {
      console.log("ctx", ctx);
      if (!required) return true;
      let valid = true;
      const errors = [];
      required.forEach((requiredKey) => {
        //required property is missing from data and is not readOnly
        if (
          data[requiredKey] === undefined &&
          !parentSchema.properties[requiredKey].readOnly
        ) {
          valid = false;
          errors.push({
            instancePath: ctx.instancePath,
            schemaPath: it.schemaPath.str,
            keyword: "required",
            params: { missingProperty: requiredKey },
            message: `must have required property '${requiredKey}' `,
          });
        }
      });
      if (!valid) {
        validate.errors = errors;
      }
      return valid;
    };
    return validate;
  },
});
subscribeAjv.removeKeyword("readOnly");
subscribeAjv.addKeyword({
  keyword: "readOnly",
  schemaType: "boolean",
  compile(readOnly, parentSchema, it) {
    const validate = (data, ctx) => {
      //required property is readOnly and provided
      if (readOnly && data !== null) {
        validate.errors = [
          {
            instancePath: ctx.instancePath,
            schemaPath: it.schemaPath.str,
            keyword: "readOnly",
            params: { readOnlyProperty: ctx.instancePath.substring(1) },
            message: `should not provide readOnly property '${ctx.instancePath.substring(
              1
            )}' `,
          },
        ];
        return false;
      }
      return true;
    };
    return validate;
  },
});

const messageValidatorById = new Map();
messageSchemaById.forEach((message, messageId) => {
  const validator = subscribeAjv.compile(message.payload || {});
  messageValidatorById.set(messageId, validator);
});
export const parseDmMessageInput = (instance, event) => {
  const validator = messageValidatorById.get(event);
  const result = validator(instance);
  if (!result) {
    // console.log("schema", validator.schema);
    // console.log("instance", instance);
    console.log("errors", validator.errors);
    // handleSocketErrors(validator.schema, instance, validator.errors);
  }

  return;

  // const errors = validator.validate(instance, schema).errors;
  // if (errors.length > 0) {
  //   //return custom errors
  //   throw validationErrorHandler(errors, event);
  // }
  // //extract only wanted properties
  // return { content: instance.content, receiverUid: instance.receiverUid };
};
function handleSocketErrors(schema, data, ajvErrors) {
  //for each ajvError, push custom error to errors array
  const betterErrors = betterAjvErrors({
    schema,
    data,
    errors: ajvErrors,
  });
  console.log(betterErrors);
  // const errors = ajvErrors.map((error) => {
  //   if (error.schemaPath.endsWith("/prohibited/not")) {
  //     return;
  //   }

  //   if (error.keyword === "prohibited") {
  //     console.log("prohibitedProperty:", error.params.prohibitedProperty);
  //     return {
  //       code: "ERR",
  //       event: event,
  //       message: `"${error.params.prohibitedProperty}" is not valid`,
  //       detail: error.message,
  //     };
  //   }
  // });
  // return new ValidationError(errors);
}
