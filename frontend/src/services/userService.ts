import apiService from './api';
import { User, UserPreferencesForm } from '../types';

export class UserService {
  /**
   * Create a new user or get existing user by ID
   */
  async createOrGetUser(userId?: string): Promise<User> {
    return apiService.post<User>('/users', { userId });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    return apiService.get<User>(`/users/${userId}`);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    preferences: UserPreferencesForm
  ): Promise<User> {
    return apiService.put<User>(`/users/${userId}/preferences`, preferences);
  }
}

export const userService = new UserService();