import { ApiClient, ApiResponse } from './apiClient';
import { User } from '../types';

export class UsersApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  getUsers(): Promise<ApiResponse<User[]>> {
    return this.client.get<User[]>('/users');
  }

  getUser(id: number): Promise<ApiResponse<User>> {
    return this.client.get<User>(`/users/${id}`);
  }
}
