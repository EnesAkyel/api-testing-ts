import { ApiClient, MoviesApi } from '../../api';
import { config } from '../../config';
import { movieSchema, movieListSchema } from '../../schemas';
import { validateSchema } from '../../helpers/schemaValidator';

const moviesApi = new MoviesApi(new ApiClient(config.baseUrl));

describe('@contract Movies API', () => {
  describe('GET /movies', () => {
    it('content array matches Movie[] schema', async () => {
      const { data } = await moviesApi.getMovies({ size: 100 });
      validateSchema(movieListSchema, data.content);
    });

    it('every item individually matches the Movie schema', async () => {
      const { data } = await moviesApi.getMovies({ size: 100 });
      data.content.forEach((m) => validateSchema(movieSchema, m));
    });

    it('response includes required pagination fields', async () => {
      const { data } = await moviesApi.getMovies();
      expect(typeof data.totalElements).toBe('number');
      expect(typeof data.page).toBe('number');
      expect(typeof data.size).toBe('number');
      expect(typeof data.totalPages).toBe('number');
    });
  });

  describe('GET /movie/:mid', () => {
    it('response body matches Movie schema', async () => {
      const { data } = await moviesApi.getMovie(1001);
      validateSchema(movieSchema, data);
    });

    it('contains all required fields with correct types', async () => {
      const { data } = await moviesApi.getMovie(1001);
      expect(typeof data.mid).toBe('number');
      expect(typeof data.name).toBe('string');
      expect(typeof data.genre).toBe('string');
      expect(typeof data.price).toBe('number');
      expect(typeof data.rating).toBe('string');
      expect(typeof data.studio).toBe('number');
    });
  });

  describe('POST /movie', () => {
    const payload = { mid: 5099, name: 'Contract Test Movie', genre: 'Drama', price: 12.99, rating: 'PG', studio: 1 };

    afterAll(async () => {
      const moviesApiCleanup = new MoviesApi(new ApiClient(config.baseUrl));
      await moviesApiCleanup.deleteMovie(payload.mid).catch(() => null);
    });

    it('created resource matches Movie schema', async () => {
      const { data } = await moviesApi.createMovie(payload);
      validateSchema(movieSchema, data);
    });
  });
});
