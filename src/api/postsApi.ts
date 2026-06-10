import { ApiClient, ApiResponse } from './apiClient';
import { Post } from '../types';

export class PostsApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  getPosts(): Promise<ApiResponse<Post[]>> {
    return this.client.get<Post[]>('/posts');
  }

  getPost(id: number): Promise<ApiResponse<Post>> {
    return this.client.get<Post>(`/posts/${id}`);
  }

  createPost(payload: Omit<Post, 'id'>): Promise<ApiResponse<Post>> {
    return this.client.post<Post>('/posts', payload);
  }

  updatePost(id: number, payload: Partial<Post>): Promise<ApiResponse<Post>> {
    return this.client.put<Post>(`/posts/${id}`, payload);
  }

  deletePost(id: number): Promise<ApiResponse<unknown>> {
    return this.client.delete(`/posts/${id}`);
  }
}
