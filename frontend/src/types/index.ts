export interface User {
  id: string;
  createdAt: string;
  lastAccessedAt: string;
  preferences: {
    theme: 'dark' | 'light';
    defaultView: 'grid' | 'list';
  };
}

export interface Series {
  id: string;
  tmdbId?: number;
  title: string;
  description?: string;
  posterUrl?: string;
  genres: string[];
  platforms: string[];
  totalSeasons: number;
  status: 'ongoing' | 'completed' | 'cancelled';
  firstAired?: string;
  lastUpdated: string;
  imdbRating?: number;
  seasons: Season[];
  originalLanguage?: string;
  popularity?: number;
}

export interface Season {
  seasonNumber: number;
  episodeCount: number;
  aired?: string;
}

export interface UserSeriesTracking {
  id: string;
  userId: string;
  seriesId: string;
  series?: Series;
  status: 'watching' | 'completed' | 'pending' | 'dropped';
  currentSeason: number;
  currentEpisode: number;
  rating?: number;
  notes?: string;
  dateAdded: string;
  dateStarted?: string;
  dateCompleted?: string;
  lastUpdated: string;
  lastViewedDate?: string;
  completionPercentage?: number;
}

export interface Platform {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  iconUrl?: string;
  color?: string;
  website?: string;
  isActive: boolean;
}

export interface SearchFilters {
  query?: string;
  genre?: string;
  year?: number;
  platform?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResponse<T> {
  results: T[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  timestamp: string;
}

export interface ApiError {
  error: boolean;
  message: string;
  statusCode?: number;
  details?: any;
  timestamp: string;
}

export interface TrackingStats {
  stats: {
    watching: number;
    completed: number;
    pending: number;
    dropped: number;
    total: number;
  };
  recentActivity: UserSeriesTracking[];
}

export interface Genre {
  id: number;
  name: string;
}

// Form types
export interface AddToTrackingForm {
  seriesId: string;
  status?: 'watching' | 'pending';
  currentSeason?: number;
  currentEpisode?: number;
}

export interface UpdateTrackingForm {
  status?: 'watching' | 'completed' | 'pending' | 'dropped';
  currentSeason?: number;
  currentEpisode?: number;
  rating?: number;
  notes?: string;
  lastViewedDate?: string;
}

export interface UserPreferencesForm {
  theme?: 'dark' | 'light';
  defaultView?: 'grid' | 'list';
}

// UI State types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

// Hook return types
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UsePaginationResult {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

// Component prop types
export interface SeriesCardProps {
  series: Series;
  tracking?: UserSeriesTracking;
  onTrackingUpdate?: (tracking: UserSeriesTracking) => void;
  showAddButton?: boolean;
  variant?: 'default' | 'compact';
}

export interface FilterBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  genres: Genre[];
  platforms: Platform[];
  loading?: boolean;
}

export interface ProgressBarProps {
  current: number;
  total: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Utility types
export type Status = UserSeriesTracking['status'];
export type SeriesStatus = Series['status'];
export type Theme = User['preferences']['theme'];
export type ViewMode = User['preferences']['defaultView'];

// API endpoint types
export type ApiEndpoint = 
  | '/users'
  | `/users/${string}`
  | `/users/${string}/preferences`
  | `/users/${string}/tracking`
  | `/users/${string}/tracking/${string}`
  | `/users/${string}/tracking/stats`
  | '/series/search'
  | '/series/discover'
  | '/series/genres'
  | `/series/${string}`
  | `/series/${string}/season/${number}`;

// Environment variables
export interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}