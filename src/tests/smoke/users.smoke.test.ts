import { ApiClient, UsersApi } from '../../api';
import { config } from '../../config';

const usersApi = new UsersApi(new ApiClient(config.baseUrl));

describe('@smoke Users API', () => {
  it('GET /users returns 200', async () => {
    const response = await usersApi.getUsers();
    expect(response.status).toBe(200);
    expect(response).toRespondWithin(config.responseTimeThresholdMs);
  });

  it('GET /users/1 returns 200 with a user body', async () => {
    const response = await usersApi.getUser(1);
    expect(response.status).toBe(200);
    expect(response.data.id).toBe(1);
    expect(response).toRespondWithin(config.responseTimeThresholdMs);
  });
});