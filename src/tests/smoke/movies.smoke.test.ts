import { ApiClient, MoviesApi } from '../../api';
import { config } from '../../config';

const moviesApi = new MoviesApi(new ApiClient(config.baseUrl));

describe('@smoke Movies API', () => {
  it('GET /movies returns 200', async () => {
    const response = await moviesApi.getMovies();
    expect(response.status).toBe(200);
    expect(response).toRespondWithin(config.responseTimeThresholdMs);
  });

  it('GET /movie/1001 returns 200 with a movie body', async () => {
    const response = await moviesApi.getMovie(1001);
    expect(response.status).toBe(200);
    expect(response.data.mid).toBe(1001);
    expect(response).toRespondWithin(config.responseTimeThresholdMs);
  });
});
