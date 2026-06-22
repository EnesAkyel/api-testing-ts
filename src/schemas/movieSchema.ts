import { JSONSchemaType } from 'ajv';
import { Movie } from '../types';

export const movieSchema: JSONSchemaType<Movie> = {
  type: 'object',
  properties: {
    mid: { type: 'integer' },
    name: { type: 'string' },
    genre: { type: 'string' },
    price: { type: 'number' },
    rating: { type: 'string' },
    studio: { type: 'integer' },
  },
  required: ['mid', 'name', 'genre', 'price', 'rating', 'studio'],
  additionalProperties: false,
};

export const movieListSchema: JSONSchemaType<Movie[]> = {
  type: 'array',
  items: movieSchema,
};
