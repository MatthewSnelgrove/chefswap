export const addRequiredKeyword = (ajv, readWriteMode) => {
  let onlyMode;
  switch (readWriteMode) {
    case "read":
      onlyMode = "readOnly";
      break;
    case "write":
      onlyMode = "writeOnly";
      break;
    default:
      throw new Error(`invalid readWriteMode: ${readWriteMode}`);
  }
  ajv.removeKeyword("required");
  ajv.addKeyword("required", {
    schemaType: "array",
    compile(required, parentSchema, it) {
      const validate = (data, ctx) => {
        if (!required) return true;
        let valid = true;
        const errors = [];
        required.forEach((requiredKey) => {
          //required property is missing from data and is not readOnly/writeOnly
          if (
            data[requiredKey] === undefined &&
            !parentSchema.properties[requiredKey][onlyMode]
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
};

export const addReadOnlyKeyword = (ajv) => {
  ajv.removeKeyword("readOnly");
  ajv.addKeyword({
    keyword: "readOnly",
    schemaType: "boolean",
    compile(readOnly, parentSchema, it) {
      const validate = (data, ctx) => {
        //property is readOnly but is provided
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
};
