import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '../types';

class ApiService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any auth headers here if needed
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => {
        return response;
      },
      (error) => {
        if (error.response?.data) {
          const apiError: ApiError = error.response.data;
          throw new Error(apiError.message || 'An error occurred');
        }
        
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please try again.');
        }
        
        if (!error.response) {
          throw new Error('Network error. Please check your connection.');
        }
        
        throw new Error(error.message || 'An unexpected error occurred');
      }
    );
  }

  // Generic methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(endpoint, { params });
    return response.data.data;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(endpoint, data);
    return response.data.data;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(endpoint, data);
    return response.data.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(endpoint);
    return response.data.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Get base URL for building full URLs
  getBaseURL(): string {
    return this.baseURL;
  }

  // Get full URL for an endpoint
  getFullURL(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;