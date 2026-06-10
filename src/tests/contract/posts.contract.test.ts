import { ApiClient, PostsApi } from '../../api';
import { config } from '../../config';
import { postSchema, postListSchema } from '../../schemas';
import { validateSchema } from '../../helpers/schemaValidator';

const postsApi = new PostsApi(new ApiClient(config.baseUrl));

describe('@contract Posts API', () => {
  describe('GET /posts', () => {
    it('response body matches Post[] schema', async () => {
      const { data } = await postsApi.getPosts();
      validateSchema(postListSchema, data);
    });

    it('every item in the list individually matches the Post schema', async () => {
      const { data } = await postsApi.getPosts();
      data.forEach((post) => validateSchema(postSchema, post));
    });
  });

  describe('GET /posts/:id', () => {
    it('response body matches Post schema', async () => {
      const { data } = await postsApi.getPost(1);
      validateSchema(postSchema, data);
    });

    it('contains all required fields with correct types', async () => {
      const { data } = await postsApi.getPost(1);
      expect(typeof data.id).toBe('number');
      expect(typeof data.userId).toBe('number');
      expect(typeof data.title).toBe('string');
      expect(typeof data.body).toBe('string');
    });
  });

  describe('POST /posts', () => {
    it('created resource matches Post schema', async () => {
      const { data } = await postsApi.createPost({
        userId: 1,
        title: 'Contract Test',
        body: 'Body',
      });
      validateSchema(postSchema, data);
    });
  });
});
