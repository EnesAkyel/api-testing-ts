import { ApiClient, UsersApi } from '../../api';
import { config } from '../../config';
import { userSchema, userListSchema } from '../../schemas';
import { validateSchema } from '../../helpers/schemaValidator';

const usersApi = new UsersApi(new ApiClient(config.baseUrl));

describe('@contract Users API', () => {
  describe('GET /users', () => {
    it('response body matches User[] schema', async () => {
      const { data } = await usersApi.getUsers();
      validateSchema(userListSchema, data);
    });

    it('every item in the list individually matches the User schema', async () => {
      const { data } = await usersApi.getUsers();
      data.forEach((user) => validateSchema(userSchema, user));
    });
  });

  describe('GET /users/:id', () => {
    it('response body matches User schema', async () => {
      const { data } = await usersApi.getUser(1);
      validateSchema(userSchema, data);
    });

    it('contains all required top-level fields with correct types', async () => {
      const { data } = await usersApi.getUser(1);
      expect(typeof data.id).toBe('number');
      expect(typeof data.name).toBe('string');
      expect(typeof data.username).toBe('string');
      expect(typeof data.email).toBe('string');
      expect(typeof data.phone).toBe('string');
      expect(typeof data.website).toBe('string');
    });

    it('address object contains all required nested fields', async () => {
      const { data } = await usersApi.getUser(1);
      expect(typeof data.address.street).toBe('string');
      expect(typeof data.address.city).toBe('string');
      expect(typeof data.address.zipcode).toBe('string');
      expect(typeof data.address.geo.lat).toBe('string');
      expect(typeof data.address.geo.lng).toBe('string');
    });

    it('company object contains all required fields', async () => {
      const { data } = await usersApi.getUser(1);
      expect(typeof data.company.name).toBe('string');
      expect(typeof data.company.catchPhrase).toBe('string');
      expect(typeof data.company.bs).toBe('string');
    });
  });
});