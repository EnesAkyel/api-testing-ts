import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  durationMs: number;
}

export class ApiClient {
  private readonly client: AxiosInstance;

  constructor(baseURL: string, config: AxiosRequestConfig = {}) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
      ...config,
    });
  }

  async get<T>(path: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const start = Date.now();
    const response: AxiosResponse<T> = await this.client.get<T>(path, config);
    return this.toApiResponse(response, start);
  }

  async post<T>(
    path: string,
    body?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const start = Date.now();
    const response: AxiosResponse<T> = await this.client.post<T>(path, body, config);
    return this.toApiResponse(response, start);
  }

  async put<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const start = Date.now();
    const response: AxiosResponse<T> = await this.client.put<T>(path, body, config);
    return this.toApiResponse(response, start);
  }

  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const start = Date.now();
    const response: AxiosResponse<T> = await this.client.delete<T>(path, config);
    return this.toApiResponse(response, start);
  }

  private toApiResponse<T>(response: AxiosResponse<T>, startTime: number): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>,
      durationMs: Date.now() - startTime,
    };
  }
}
