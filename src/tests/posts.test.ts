import { ApiClient, PostsApi } from '../api';
import { config } from '../config';
import { postSchema, postListSchema } from '../schemas';
import { validateSchema } from '../helpers/schemaValidator';

const postsApi = new PostsApi(new ApiClient(config.baseUrl));

describe('Posts API', () => {
  describe('GET /posts', () => {
    it('returns a list of posts with correct status and schema', async () => {
      const response = await postsApi.getPosts();

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response).toRespondWithin(config.responseTimeThresholdMs);
      validateSchema(postListSchema, response.data);
    });
  });

  describe('GET /posts/:id', () => {
    it('returns a single post with correct status and schema', async () => {
      const response = await postsApi.getPost(1);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(1);
      expect(response).toRespondWithin(config.responseTimeThresholdMs);
      validateSchema(postSchema, response.data);
    });

    it('returns 404 for a non-existent post', async () => {
      await expect(postsApi.getPost(99999)).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });

  describe('POST /posts', () => {
    it('creates a new post and returns it with an assigned id', async () => {
      const payload = { userId: 1, title: 'Test Post', body: 'Test body content' };
      const response = await postsApi.createPost(payload);

      expect(response.status).toBe(201);
      expect(response.data.id).toBeDefined();
      expect(response.data.title).toBe(payload.title);
      expect(response).toRespondWithin(config.responseTimeThresholdMs);
      validateSchema(postSchema, response.data);
    });
  });

  describe('PUT /posts/:id', () => {
    it('updates a post and returns the updated resource', async () => {
      const response = await postsApi.updatePost(1, { title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.data.title).toBe('Updated Title');
    });
  });

  describe('DELETE /posts/:id', () => {
    it('deletes a post and returns 200', async () => {
      const response = await postsApi.deletePost(1);

      expect(response.status).toBe(200);
    });
  });
});
