import { ApiClient, StudiosApi } from '../../api';
import { config } from '../../config';

const studiosApi = new StudiosApi(new ApiClient(config.baseUrl));

describe('@smoke Studios API', () => {
  it('GET /studios returns 200', async () => {
    const response = await studiosApi.getStudios();
    expect(response.status).toBe(200);
    expect(response).toRespondWithin(config.responseTimeThresholdMs);
  });
});
