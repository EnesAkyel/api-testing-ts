import { ApiClient, ApiResponse } from './apiClient';
import { Studio, PageResponse } from '../types';

export class StudiosApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  getStudios(page = 0, size = 10): Promise<ApiResponse<PageResponse<Studio>>> {
    return this.client.get<PageResponse<Studio>>('/studios', { params: { page, size } });
  }

  createStudio(payload: Studio): Promise<ApiResponse<Studio>> {
    return this.client.post<Studio>('/studio', payload);
  }

  updateStudio(sid: number, payload: Studio): Promise<ApiResponse<Studio>> {
    return this.client.put<Studio>(`/studio/${sid}`, payload);
  }

  deleteStudio(sid: number): Promise<ApiResponse<Studio>> {
    return this.client.delete<Studio>(`/studio/${sid}`);
  }
}
