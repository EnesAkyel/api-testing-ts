import { ApiClient, PostsApi, UsersApi } from '../src/api';
import { config } from '../src/config';
import { postSchema, postListSchema, userSchema } from '../src/schemas';
import { validateSchema } from '../src/helpers/schemaValidator';

const client = new ApiClient(config.baseUrl);
const postsApi = new PostsApi(client);
const usersApi = new UsersApi(client);

describe('@regression Posts API', () => {
  describe('GET /posts — collection integrity', () => {
    it('returns exactly 100 posts', async () => {
      const { data } = await postsApi.getPosts();
      expect(data).toHaveLength(100);
    });

    it('every post has a unique id', async () => {
      const { data } = await postsApi.getPosts();
      const ids = data.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all posts match the schema', async () => {
      const { data } = await postsApi.getPosts();
      validateSchema(postListSchema, data);
    });

    it('all userId values reference a valid user', async () => {
      const [{ data: posts }, { data: users }] = await Promise.all([
        postsApi.getPosts(),
        usersApi.getUsers(),
      ]);
      const validUserIds = new Set(users.map((u) => u.id));
      const orphanedPosts = posts.filter((p) => !validUserIds.has(p.userId));
      expect(orphanedPosts).toHaveLength(0);
    });
  });

  describe('GET /posts/:id — individual retrieval', () => {
    it.each([1, 50, 100])('post %i is retrievable and matches schema', async (id) => {
      const { data, status } = await postsApi.getPost(id);
      expect(status).toBe(200);
      validateSchema(postSchema, data);
      expect(data.id).toBe(id);
    });

    it('individual post data matches the corresponding entry in the full list', async () => {
      const [single, list] = await Promise.all([
        postsApi.getPost(1),
        postsApi.getPosts(),
      ]);
      const postFromList = list.data.find((p) => p.id === 1);
      expect(postFromList).toBeDefined();
      expect(single.data).toEqual(postFromList);
    });
  });

  describe('POST /posts — write operations', () => {
    it('created post is assigned a new id', async () => {
      const { data, status } = await postsApi.createPost({
        userId: 1,
        title: 'Regression Post',
        body: 'Regression body',
      });
      expect(status).toBe(201);
      expect(data.id).toBeDefined();
      expect(typeof data.id).toBe('number');
    });

    it('created post echoes the submitted payload', async () => {
      const payload = { userId: 2, title: 'Echo Test', body: 'Payload echo body' };
      const { data } = await postsApi.createPost(payload);
      expect(data.userId).toBe(payload.userId);
      expect(data.title).toBe(payload.title);
      expect(data.body).toBe(payload.body);
    });
  });

  describe('PUT /posts/:id — full update', () => {
    it('updated post reflects all submitted fields', async () => {
      const payload = { userId: 1, title: 'Updated Title', body: 'Updated body' };
      const { data, status } = await postsApi.updatePost(1, payload);
      expect(status).toBe(200);
      expect(data.title).toBe(payload.title);
      expect(data.body).toBe(payload.body);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('returns 200 on successful deletion', async () => {
      const { status } = await postsApi.deletePost(1);
      expect(status).toBe(200);
    });
  });
});

describe('@regression Users API', () => {
  describe('GET /users — collection integrity', () => {
    it('returns exactly 10 users', async () => {
      const { data } = await usersApi.getUsers();
      expect(data).toHaveLength(10);
    });

    it('all users have unique ids, usernames, and emails', async () => {
      const { data } = await usersApi.getUsers();
      const ids = data.map((u) => u.id);
      const usernames = data.map((u) => u.username);
      const emails = data.map((u) => u.email);
      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(usernames).size).toBe(usernames.length);
      expect(new Set(emails).size).toBe(emails.length);
    });
  });

  describe('GET /users/:id — individual retrieval', () => {
    it('individual user data matches the corresponding entry in the full list', async () => {
      const [single, list] = await Promise.all([
        usersApi.getUser(3),
        usersApi.getUsers(),
      ]);
      const userFromList = list.data.find((u) => u.id === 3);
      expect(userFromList).toBeDefined();
      expect(single.data).toEqual(userFromList);
    });

    it.each([1, 5, 10])('user %i is retrievable and matches schema', async (id) => {
      const { data, status } = await usersApi.getUser(id);
      expect(status).toBe(200);
      validateSchema(userSchema, data);
      expect(data.id).toBe(id);
    });
  });
});