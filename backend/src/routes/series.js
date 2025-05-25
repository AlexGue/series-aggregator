import express from 'express';
import { Series, Platform } from '../models/index.js';
import tmdbService from '../services/tmdbService.js';
import { createErrorResponse, createSuccessResponse, parsePagination, sanitizeInput } from '../utils/helpers.js';

const router = express.Router();

/**
 * GET /api/series/search
 * Search for TV series
 */
router.get('/search', async (req, res) => {
  try {
    const { q: query, platform, genre, year, page } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json(
        createErrorResponse('Search query must be at least 2 characters', 400)
      );
    }
    
    const sanitizedQuery = sanitizeInput(query);
    const pageNum = parseInt(page) || 1;
    
    // Search using TMDB API
    const tmdbResults = await tmdbService.searchTVSeries(sanitizedQuery, pageNum);
    
    // Apply additional filters if provided
    let filteredResults = tmdbResults.results;
    
    if (genre) {
      const genreFilter = sanitizeInput(genre).toLowerCase();
      filteredResults = filteredResults.filter(series => 
        series.genres?.some(g => g.toLowerCase().includes(genreFilter))
      );
    }
    
    if (year) {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        filteredResults = filteredResults.filter(series => {
          const seriesYear = series.firstAired ? new Date(series.firstAired).getFullYear() : null;
          return seriesYear === yearNum;
        });
      }
    }
    
    const response = {
      ...tmdbResults,
      results: filteredResults,
      totalResults: filteredResults.length
    };
    
    res.json(
      createSuccessResponse(response, 'Search completed successfully')
    );
  } catch (error) {
    console.error('Error searching series:', error);
    res.status(500).json(
      createErrorResponse('Failed to search series')
    );
  }
});

/**
 * GET /api/series/discover
 * Discover series with filters
 */
router.get('/discover', async (req, res) => {
  try {
    const { genre, year, platform, sort_by = 'popularity.desc', page = 1 } = req.query;
    
    const filters = {
      page: parseInt(page) || 1,
      sort_by
    };
    
    if (genre) {
      // Convert genre name to TMDB genre ID if needed
      const genres = await tmdbService.getTVGenres();
      const genreObj = genres.find(g => g.name.toLowerCase() === genre.toLowerCase());
      if (genreObj) {
        filters.with_genres = genreObj.id;
      }
    }
    
    if (year) {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        filters.first_air_date_year = yearNum;
      }
    }
    
    const results = await tmdbService.discoverTVSeries(filters);
    
    res.json(
      createSuccessResponse(results, 'Series discovered successfully')
    );
  } catch (error) {
    console.error('Error discovering series:', error);
    res.status(500).json(
      createErrorResponse('Failed to discover series')
    );
  }
});

/**
 * GET /api/series/:seriesId
 * Get series details by ID
 */
router.get('/:seriesId', async (req, res) => {
  try {
    const { seriesId } = req.params;
    
    // Try to find in local database first
    let series = await Series.findOne({ id: seriesId }).populate('platforms');
    
    if (!series) {
      // If not found locally, try to fetch from TMDB
      const tmdbId = parseInt(seriesId);
      if (!isNaN(tmdbId)) {
        const tmdbSeries = await tmdbService.getTVSeriesDetails(tmdbId);
        
        // Save to local database for future requests
        series = new Series(tmdbSeries);
        await series.save();
      } else {
        return res.status(404).json(
          createErrorResponse('Series not found', 404)
        );
      }
    }
    
    res.json(
      createSuccessResponse(series, 'Series details retrieved successfully')
    );
  } catch (error) {
    console.error('Error getting series details:', error);
    res.status(500).json(
      createErrorResponse('Failed to get series details')
    );
  }
});

/**
 * GET /api/series/:seriesId/season/:seasonNumber
 * Get season details
 */
router.get('/:seriesId/season/:seasonNumber', async (req, res) => {
  try {
    const { seriesId, seasonNumber } = req.params;
    const season = parseInt(seasonNumber);
    
    if (isNaN(season) || season < 1) {
      return res.status(400).json(
        createErrorResponse('Invalid season number', 400)
      );
    }
    
    const tmdbId = parseInt(seriesId);
    if (isNaN(tmdbId)) {
      return res.status(400).json(
        createErrorResponse('Invalid series ID', 400)
      );
    }
    
    const seasonDetails = await tmdbService.getSeasonDetails(tmdbId, season);
    
    res.json(
      createSuccessResponse(seasonDetails, 'Season details retrieved successfully')
    );
  } catch (error) {
    console.error('Error getting season details:', error);
    res.status(500).json(
      createErrorResponse('Failed to get season details')
    );
  }
});

/**
 * GET /api/series/genres
 * Get list of TV genres
 */
router.get('/genres', async (req, res) => {
  try {
    const genres = await tmdbService.getTVGenres();
    
    res.json(
      createSuccessResponse(genres, 'Genres retrieved successfully')
    );
  } catch (error) {
    console.error('Error getting genres:', error);
    res.status(500).json(
      createErrorResponse('Failed to get genres')
    );
  }
});

export default router;