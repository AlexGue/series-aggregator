import apiService from './api';
import { Series, SearchResponse, SearchFilters, Genre } from '../types';

export class SeriesService {
  /**
   * Search for TV series
   */
  async searchSeries(
    filters: SearchFilters & { page?: number }
  ): Promise<SearchResponse<Series>> {
    const params: Record<string, any> = {};
    
    if (filters.query) params.q = filters.query;
    if (filters.genre) params.genre = filters.genre;
    if (filters.year) params.year = filters.year;
    if (filters.platform) params.platform = filters.platform;
    if (filters.page) params.page = filters.page;
    
    return apiService.get<SearchResponse<Series>>('/series/search', params);
  }

  /**
   * Discover series with filters
   */
  async discoverSeries(
    filters: Omit<SearchFilters, 'query'> & { page?: number }
  ): Promise<SearchResponse<Series>> {
    const params: Record<string, any> = {};
    
    if (filters.genre) params.genre = filters.genre;
    if (filters.year) params.year = filters.year;
    if (filters.platform) params.platform = filters.platform;
    if (filters.sortBy) params.sort_by = filters.sortBy;
    if (filters.page) params.page = filters.page;
    
    return apiService.get<SearchResponse<Series>>('/series/discover', params);
  }

  /**
   * Get series details by ID
   */
  async getSeriesById(seriesId: string): Promise<Series> {
    return apiService.get<Series>(`/series/${seriesId}`);
  }

  /**
   * Get season details
   */
  async getSeasonDetails(seriesId: string, seasonNumber: number): Promise<any> {
    return apiService.get<any>(`/series/${seriesId}/season/${seasonNumber}`);
  }

  /**
   * Get list of TV genres
   */
  async getGenres(): Promise<Genre[]> {
    return apiService.get<Genre[]>('/series/genres');
  }
}

export const seriesService = new SeriesService();