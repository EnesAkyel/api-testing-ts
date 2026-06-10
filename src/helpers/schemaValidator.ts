import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';

const ajv = new Ajv({ allErrors: true });

export function compileSchema<T>(schema: JSONSchemaType<T>): ValidateFunction<T> {
  return ajv.compile(schema);
}

export function validateSchema<T>(schema: JSONSchemaType<T>, data: unknown): void {
  const validate = compileSchema(schema);
  const valid = validate(data);
  if (!valid) {
    const errors = validate.errors!.map((e) => `${e.instancePath} ${e.message}`).join('; ');
    throw new Error(`Schema validation failed: ${errors}`);
  }
}
