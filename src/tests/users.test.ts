import { ApiClient, UsersApi } from '../api';
import { config } from '../config';
import { userSchema, userListSchema } from '../schemas';
import { validateSchema } from '../helpers/schemaValidator';

const usersApi = new UsersApi(new ApiClient(config.baseUrl));

describe('Users API', () => {
  describe('GET /users', () => {
    it('returns a list of users with correct status and schema', async () => {
      const response = await usersApi.getUsers();

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response).toRespondWithin(config.responseTimeThresholdMs);
      validateSchema(userListSchema, response.data);
    });

    it('returns exactly 10 users', async () => {
      const response = await usersApi.getUsers();
      expect(response.data).toHaveLength(10);
    });

    it('every user has a unique id', async () => {
      const { data } = await usersApi.getUsers();
      const ids = data.map((u) => u.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('GET /users/:id', () => {
    it('returns the correct user for a given id', async () => {
      const response = await usersApi.getUser(1);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(1);
      expect(response).toRespondWithin(config.responseTimeThresholdMs);
      validateSchema(userSchema, response.data);
    });

    it('returns 404 for a non-existent user', async () => {
      await expect(usersApi.getUser(99999)).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it('individual endpoint and list endpoint return consistent data for the same user', async () => {
      const [single, list] = await Promise.all([
        usersApi.getUser(1),
        usersApi.getUsers(),
      ]);
      const userFromList = list.data.find((u) => u.id === 1);
      expect(userFromList).toBeDefined();
      expect(single.data).toEqual(userFromList);
    });
  });
});