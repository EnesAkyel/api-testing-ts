import { ApiClient, MoviesApi } from '../api';
import { config } from '../config';
import { movieSchema, movieListSchema } from '../schemas';
import { validateSchema } from '../helpers/schemaValidator';
import { Movie } from '../types';

const moviesApi = new MoviesApi(new ApiClient(config.baseUrl));

const TEST_MOVIE: Movie = {
  mid: 5001,
  name: 'Test Movie',
  genre: 'Action',
  price: 9.99,
  rating: 'PG-13',
  studio: 1,
};

beforeAll(async () => {
  await moviesApi.deleteMovie(TEST_MOVIE.mid).catch(() => null);
});

afterAll(async () => {
  await moviesApi.deleteMovie(TEST_MOVIE.mid).catch(() => null);
});

describe('Movies API', () => {
  describe('GET /movies', () => {
    it('returns 200 with paginated response', async () => {
      const response = await moviesApi.getMovies();
      expect(response.status).toBe(200);
      expect(response).toRespondWithin(config.responseTimeThresholdMs);
      expect(response.data.content).toBeInstanceOf(Array);
      expect(response.data.totalElements).toBeGreaterThan(0);
    });

    it('content matches Movie[] schema', async () => {
      const { data } = await moviesApi.getMovies({ size: 100 });
      expect(() => validateSchema(movieListSchema, data.content)).not.toThrow();
    });

    it('filters by genre', async () => {
      const { data } = await moviesApi.getMovies({ genre: 'Action', size: 100 });
      expect(data.content.length).toBeGreaterThan(0);
      data.content.forEach((m) => expect(m.genre).toBe('Action'));
    });

    it('filters by rating', async () => {
      const { data } = await moviesApi.getMovies({ rating: 'PG-13', size: 100 });
      expect(data.content.length).toBeGreaterThan(0);
      data.content.forEach((m) => expect(m.rating).toBe('PG-13'));
    });

    it('filters by maxPrice', async () => {
      const { data } = await moviesApi.getMovies({ maxPrice: 5.0, size: 100 });
      data.content.forEach((m) => expect(m.price).toBeLessThanOrEqual(5.0));
    });

    it('filters by minPrice', async () => {
      const { data } = await moviesApi.getMovies({ minPrice: 100.0, size: 100 });
      expect(data.content.length).toBeGreaterThan(0);
      data.content.forEach((m) => expect(m.price).toBeGreaterThanOrEqual(100.0));
    });

    it('paginates — page 0 and page 1 return different movies', async () => {
      const [page0, page1] = await Promise.all([
        moviesApi.getMovies({ page: 0, size: 5 }),
        moviesApi.getMovies({ page: 1, size: 5 }),
      ]);
      expect(page0.data.content[0].mid).not.toBe(page1.data.content[0].mid);
    });
  });

  describe('GET /movie/:mid', () => {
    it('returns a seeded movie by MID', async () => {
      const response = await moviesApi.getMovie(1001);
      expect(response.status).toBe(200);
      expect(response.data.mid).toBe(1001);
      expect(response).toRespondWithin(config.responseTimeThresholdMs);
      validateSchema(movieSchema, response.data);
    });

    it('returns 404 for a non-existent MID', async () => {
      await expect(moviesApi.getMovie(9999)).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });

  describe('POST /movie', () => {
    it('creates a movie and returns 201', async () => {
      const response = await moviesApi.createMovie(TEST_MOVIE);
      expect(response.status).toBe(201);
      expect(response.data.mid).toBe(TEST_MOVIE.mid);
      expect(response.data.name).toBe(TEST_MOVIE.name);
      validateSchema(movieSchema, response.data);
    });

    it('returns 409 when MID already exists', async () => {
      await expect(moviesApi.createMovie(TEST_MOVIE)).rejects.toMatchObject({
        response: { status: 409 },
      });
    });

    it('returns 201 when studioID is in valid range but not in DB — no FK constraint', async () => {
      const orphan = { ...TEST_MOVIE, mid: 5010, studio: 77 };
      await moviesApi.deleteMovie(orphan.mid).catch(() => null);
      const response = await moviesApi.createMovie(orphan);
      expect(response.status).toBe(201);
      expect(response.data.studio).toBe(77);
      await moviesApi.deleteMovie(orphan.mid).catch(() => null);
    });

    describe('validation errors', () => {
      it('returns 400 with field error when MID is below 1000', async () => {
        await expect(moviesApi.createMovie({ ...TEST_MOVIE, mid: 999 })).rejects.toMatchObject({
          response: {
            status: 400,
            data: {
              message: 'Spring Validation Error',
              errors: expect.arrayContaining([expect.objectContaining({ field: 'mid' })]),
            },
          },
        });
      });

      it('returns 400 with field error when genre is invalid', async () => {
        await expect(moviesApi.createMovie({ ...TEST_MOVIE, mid: 5002, genre: 'Cartoon' })).rejects.toMatchObject({
          response: {
            status: 400,
            data: {
              message: 'Spring Validation Error',
              errors: expect.arrayContaining([expect.objectContaining({ field: 'genre' })]),
            },
          },
        });
      });

      it('returns 400 with field error when rating is invalid', async () => {
        await expect(moviesApi.createMovie({ ...TEST_MOVIE, mid: 5003, rating: 'X' })).rejects.toMatchObject({
          response: {
            status: 400,
            data: {
              message: 'Spring Validation Error',
              errors: expect.arrayContaining([expect.objectContaining({ field: 'rating' })]),
            },
          },
        });
      });
    });
  });

  describe('PUT /movie/:mid', () => {
    it('updates an existing movie', async () => {
      const updated = { ...TEST_MOVIE, name: 'Updated Movie' };
      const response = await moviesApi.updateMovie(TEST_MOVIE.mid, updated);
      expect(response.status).toBe(200);
      expect(response.data.name).toBe('Updated Movie');
    });

    it('returns 404 for a non-existent MID', async () => {
      await expect(moviesApi.updateMovie(9999, { ...TEST_MOVIE, mid: 9999 })).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });

  describe('GET /studios/:sid/movies', () => {
    it('returns movies for a known studio', async () => {
      const response = await moviesApi.getMoviesByStudio(1);
      expect(response.status).toBe(200);
      expect(response.data.length).toBeGreaterThan(0);
      response.data.forEach((m) => expect(m.studio).toBe(1));
    });

    it('returns 404 for a studio with no movies', async () => {
      await expect(moviesApi.getMoviesByStudio(99)).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });

  describe('DELETE /movie/:mid', () => {
    it('deletes a movie and returns 200 with the deleted movie', async () => {
      const response = await moviesApi.deleteMovie(TEST_MOVIE.mid);
      expect(response.status).toBe(200);
      expect(response.data.mid).toBe(TEST_MOVIE.mid);
    });

    it('returns 404 after deletion', async () => {
      await expect(moviesApi.deleteMovie(TEST_MOVIE.mid)).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });
});
