import { ApiClient, ApiResponse } from './apiClient';
import { Movie, PageResponse } from '../types';

export interface MovieFilters {
  genre?: string;
  rating?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}

export class MoviesApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  getMovies(filters?: MovieFilters): Promise<ApiResponse<PageResponse<Movie>>> {
    return this.client.get<PageResponse<Movie>>('/movies', { params: filters });
  }

  getMovie(mid: number): Promise<ApiResponse<Movie>> {
    return this.client.get<Movie>(`/movie/${mid}`);
  }

  createMovie(payload: Movie): Promise<ApiResponse<Movie>> {
    return this.client.post<Movie>('/movie', payload);
  }

  updateMovie(mid: number, payload: Movie): Promise<ApiResponse<Movie>> {
    return this.client.put<Movie>(`/movie/${mid}`, payload);
  }

  deleteMovie(mid: number): Promise<ApiResponse<Movie>> {
    return this.client.delete<Movie>(`/movie/${mid}`);
  }

  getMoviesByStudio(sid: number): Promise<ApiResponse<Movie[]>> {
    return this.client.get<Movie[]>(`/studios/${sid}/movies`);
  }
}