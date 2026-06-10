import { ApiClient, PostsApi } from '../../api';
import { config } from '../../config';

const postsApi = new PostsApi(new ApiClient(config.baseUrl));

describe('@smoke Posts API', () => {
  it('GET /posts returns 200', async () => {
    const response = await postsApi.getPosts();
    expect(response.status).toBe(200);
    expect(response).toRespondWithin(config.responseTimeThresholdMs);
  });

  it('GET /posts/1 returns 200 with a post body', async () => {
    const response = await postsApi.getPost(1);
    expect(response.status).toBe(200);
    expect(response.data.id).toBe(1);
    expect(response).toRespondWithin(config.responseTimeThresholdMs);
  });
});
