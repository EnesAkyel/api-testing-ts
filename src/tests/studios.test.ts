import { ApiClient, StudiosApi } from '../api';
import { config } from '../config';
import { studioSchema, studioListSchema } from '../schemas';
import { validateSchema } from '../helpers/schemaValidator';
import { Studio } from '../types';

const studiosApi = new StudiosApi(new ApiClient(config.baseUrl));

const TEST_STUDIO: Studio = { sid: 50, name: 'Test Studio' };

beforeAll(async () => {
  await studiosApi.deleteStudio(TEST_STUDIO.sid).catch(() => null);
});

afterAll(async () => {
  await studiosApi.deleteStudio(TEST_STUDIO.sid).catch(() => null);
});

describe('Studios API', () => {
  describe('GET /studios', () => {
    it('returns 200 with paginated response', async () => {
      const response = await studiosApi.getStudios();
      expect(response.status).toBe(200);
      expect(response).toRespondWithin(config.responseTimeThresholdMs);
      expect(response.data.content).toBeInstanceOf(Array);
      expect(response.data.totalElements).toBeGreaterThan(0);
    });

    it('content matches Studio[] schema', async () => {
      const { data } = await studiosApi.getStudios(0, 100);
      validateSchema(studioListSchema, data.content);
    });

    it('returns 5 seeded studios', async () => {
      const { data } = await studiosApi.getStudios(0, 100);
      expect(data.totalElements).toBeGreaterThanOrEqual(5);
    });
  });

  describe('POST /studio', () => {
    it('creates a studio and returns 201', async () => {
      const response = await studiosApi.createStudio(TEST_STUDIO);
      expect(response.status).toBe(201);
      expect(response.data.sid).toBe(TEST_STUDIO.sid);
      expect(response.data.name).toBe(TEST_STUDIO.name);
      validateSchema(studioSchema, response.data);
    });

    it('returns 409 when SID already exists', async () => {
      await expect(studiosApi.createStudio(TEST_STUDIO)).rejects.toMatchObject({
        response: { status: 409 },
      });
    });
  });

  describe('PUT /studio/:sid', () => {
    it('updates an existing studio', async () => {
      const updated = { ...TEST_STUDIO, name: 'Updated Studio' };
      const response = await studiosApi.updateStudio(TEST_STUDIO.sid, updated);
      expect(response.status).toBe(200);
      expect(response.data.name).toBe('Updated Studio');
    });

    it('returns 404 for a non-existent SID', async () => {
      await expect(studiosApi.updateStudio(99, { sid: 99, name: 'Ghost' })).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });

  describe('DELETE /studio/:sid', () => {
    it('deletes a studio and returns 200 with the deleted studio', async () => {
      const response = await studiosApi.deleteStudio(TEST_STUDIO.sid);
      expect(response.status).toBe(200);
      expect(response.data.sid).toBe(TEST_STUDIO.sid);
    });

    it('returns 404 after deletion', async () => {
      await expect(studiosApi.deleteStudio(TEST_STUDIO.sid)).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });
});
