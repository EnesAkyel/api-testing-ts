import { JSONSchemaType } from 'ajv';
import { Comment } from '../types';

export const commentSchema: JSONSchemaType<Comment> = {
  type: 'object',
  properties: {
    postId: { type: 'integer' },
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string' },
    body: { type: 'string' },
  },
  required: ['postId', 'id', 'name', 'email', 'body'],
  additionalProperties: false,
};
