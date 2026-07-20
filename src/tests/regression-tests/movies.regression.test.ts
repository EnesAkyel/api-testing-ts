import { ApiClient, MoviesApi, StudiosApi } from '../../api';
import { config } from '../../config';
import { movieSchema, movieListSchema } from '../../schemas';
import { validateSchema } from '../../helpers/schemaValidator';

const client = new ApiClient(config.baseUrl);
const moviesApi = new MoviesApi(client);
const studiosApi = new StudiosApi(client);

describe('@regression Movies API', () => {
  describe('GET /movies — collection integrity', () => {
    it('returns all 30 seeded movies', async () => {
      const { data } = await moviesApi.getMovies({ size: 100 });
      expect(data.totalElements).toBeGreaterThanOrEqual(30);
    });

    it('every movie has a unique MID', async () => {
      const { data } = await moviesApi.getMovies({ size: 100 });
      const mids = data.content.map((m) => m.mid);
      expect(new Set(mids).size).toBe(mids.length);
    });

    it('all movies match the schema', async () => {
      const { data } = await moviesApi.getMovies({ size: 100 });
      expect(() => validateSchema(movieListSchema, data.content)).not.toThrow();
    });

    it('all studio IDs reference a valid seeded studio', async () => {
      const [{ data: movies }, { data: studios }] = await Promise.all([
        moviesApi.getMovies({ size: 100 }),
        studiosApi.getStudios(0, 100),
      ]);
      const validSids = new Set(studios.content.map((s) => s.sid));
      const orphaned = movies.content.filter((m) => !validSids.has(m.studio));
      expect(orphaned).toHaveLength(0);
    });
  });

  describe('GET /movie/:mid — individual retrieval', () => {
    it.each([1001, 1010, 1030])('movie %i is retrievable and matches schema', async (mid) => {
      const { data, status } = await moviesApi.getMovie(mid);
      expect(status).toBe(200);
      validateSchema(movieSchema, data);
      expect(data.mid).toBe(mid);
    });

    it('individual movie data matches the corresponding entry in the full list', async () => {
      const [single, list] = await Promise.all([
        moviesApi.getMovie(1001),
        moviesApi.getMovies({ size: 100 }),
      ]);
      const fromList = list.data.content.find((m) => m.mid === 1001);
      expect(fromList).toBeDefined();
      expect(single.data).toEqual(fromList);
    });
  });

  describe('POST /movie — write operations', () => {
    const payload = { mid: 5050, name: 'Regression Movie', genre: 'Comedy', price: 7.99, rating: 'G', studio: 1 };

    beforeAll(async () => { await moviesApi.deleteMovie(payload.mid).catch(() => null); });
    afterAll(async () => { await moviesApi.deleteMovie(payload.mid).catch(() => null); });

    it('creates a movie with 201 and correct MID', async () => {
      const { data, status } = await moviesApi.createMovie(payload);
      expect(status).toBe(201);
      expect(data.mid).toBe(payload.mid);
    });

    it('created movie echoes the submitted payload', async () => {
      const { data } = await moviesApi.createMovie({ ...payload, mid: 5051 });
      expect(data.name).toBe(payload.name);
      expect(data.genre).toBe(payload.genre);
      expect(data.price).toBe(payload.price);
      await moviesApi.deleteMovie(5051).catch(() => null);
    });
  });

  describe('PUT /movie/:mid — update', () => {
    const payload = { mid: 5052, name: 'Before Update', genre: 'Horror', price: 14.99, rating: 'R', studio: 2 };

    beforeAll(async () => {
      await moviesApi.deleteMovie(payload.mid).catch(() => null);
      await moviesApi.createMovie(payload);
    });
    afterAll(async () => { await moviesApi.deleteMovie(payload.mid).catch(() => null); });

    it('updated movie reflects all submitted fields', async () => {
      const updated = { ...payload, name: 'After Update', genre: 'Thriller' };
      const { data, status } = await moviesApi.updateMovie(payload.mid, updated);
      expect(status).toBe(200);
      expect(data.name).toBe('After Update');
      expect(data.genre).toBe('Thriller');
    });
  });

  describe('DELETE /movie/:mid', () => {
    const payload = { mid: 5053, name: 'To Delete', genre: 'Mystery', price: 5.99, rating: 'PG', studio: 3 };

    beforeAll(async () => {
      await moviesApi.deleteMovie(payload.mid).catch(() => null);
      await moviesApi.createMovie(payload);
    });

    it('returns 200 on successful deletion', async () => {
      const { status } = await moviesApi.deleteMovie(payload.mid);
      expect(status).toBe(200);
    });
  });
});
