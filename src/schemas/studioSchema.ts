import { JSONSchemaType } from 'ajv';
import { Studio } from '../types';

export const studioSchema: JSONSchemaType<Studio> = {
  type: 'object',
  properties: {
    sid: { type: 'integer' },
    name: { type: 'string' },
  },
  required: ['sid', 'name'],
  additionalProperties: false,
};

export const studioListSchema: JSONSchemaType<Studio[]> = {
  type: 'array',
  items: studioSchema,
};
