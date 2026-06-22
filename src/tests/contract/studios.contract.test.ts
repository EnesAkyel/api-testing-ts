import { ApiClient, StudiosApi } from '../../api';
import { config } from '../../config';
import { studioSchema, studioListSchema } from '../../schemas';
import { validateSchema } from '../../helpers/schemaValidator';

const studiosApi = new StudiosApi(new ApiClient(config.baseUrl));

describe('@contract Studios API', () => {
  describe('GET /studios', () => {
    it('content array matches Studio[] schema', async () => {
      const { data } = await studiosApi.getStudios(0, 100);
      validateSchema(studioListSchema, data.content);
    });

    it('every item individually matches the Studio schema', async () => {
      const { data } = await studiosApi.getStudios(0, 100);
      data.content.forEach((s) => validateSchema(studioSchema, s));
    });

    it('response includes required pagination fields', async () => {
      const { data } = await studiosApi.getStudios();
      expect(typeof data.totalElements).toBe('number');
      expect(typeof data.page).toBe('number');
      expect(typeof data.size).toBe('number');
      expect(typeof data.totalPages).toBe('number');
    });
  });
});
