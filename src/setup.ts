import './helpers/assertions';
import { getAuthToken } from './helpers/auth';
import { ApiClient } from './api/apiClient';

jest.retryTimes(3, { logErrorsBeforeRetry: true });

beforeAll(async () => {
  const token = await getAuthToken();
  ApiClient.setDefaultToken(token);
});
