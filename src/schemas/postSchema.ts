import { JSONSchemaType } from 'ajv';
import { Post } from '../types';

export const postSchema: JSONSchemaType<Post> = {
  type: 'object',
  properties: {
    userId: { type: 'integer' },
    id: { type: 'integer' },
    title: { type: 'string' },
    body: { type: 'string' },
  },
  required: ['userId', 'id', 'title', 'body'],
  additionalProperties: false,
};

export const postListSchema: JSONSchemaType<Post[]> = {
  type: 'array',
  items: postSchema,
};
