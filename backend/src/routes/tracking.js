import express from 'express';
import { UserSeriesTracking, Series, User } from '../models/index.js';
import { 
  generateUUID, 
  generateTrackingId, 
  isValidUUID, 
  createErrorResponse, 
  createSuccessResponse, 
  parsePagination,
  calculateCompletionPercentage
} from '../utils/helpers.js';

const router = express.Router();

/**
 * GET /api/users/:userId/tracking
 * Get user's tracked series
 */
router.get('/:userId/tracking', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, sort = 'lastUpdated', order = 'desc' } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    
    if (!isValidUUID(userId)) {
      return res.status(400).json(
        createErrorResponse('Invalid user ID format', 400)
      );
    }
    
    // Verify user exists
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json(
        createErrorResponse('User not found', 404)
      );
    }
    
    // Build query
    const query = { userId };
    if (status && ['watching', 'completed', 'pending', 'dropped'].includes(status)) {
      query.status = status;
    }
    
    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = {};
    sortObj[sort] = sortOrder;
    
    // Get tracking records with series details
    const tracking = await UserSeriesTracking
      .find(query)
      .populate('seriesId')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);
    
    const total = await UserSeriesTracking.countDocuments(query);
    
    // Calculate completion percentages
    const trackingWithProgress = tracking.map(track => {
      const completionPercentage = track.seriesId?.seasons 
        ? calculateCompletionPercentage(
            track.currentSeason, 
            track.currentEpisode, 
            track.seriesId.seasons
          )
        : 0;
      
      return {
        ...track.toObject(),
        completionPercentage
      };
    });
    
    const meta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    };
    
    res.json(
      createSuccessResponse(trackingWithProgress, 'Tracking data retrieved successfully', meta)
    );
  } catch (error) {
    console.error('Error getting tracking data:', error);
    res.status(500).json(
      createErrorResponse('Failed to get tracking data')
    );
  }
});

/**
 * POST /api/users/:userId/tracking
 * Add series to tracking
 */
router.post('/:userId/tracking', async (req, res) => {
  try {
    const { userId } = req.params;
    const { seriesId, status = 'pending', currentSeason = 1, currentEpisode = 1 } = req.body;
    
    if (!isValidUUID(userId)) {
      return res.status(400).json(
        createErrorResponse('Invalid user ID format', 400)
      );
    }
    
    if (!seriesId) {
      return res.status(400).json(
        createErrorResponse('Series ID is required', 400)
      );
    }
    
    // Verify user exists
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json(
        createErrorResponse('User not found', 404)
      );
    }
    
    // Verify series exists (try to get from TMDB if not in local DB)
    let series = await Series.findOne({ id: seriesId });
    if (!series) {
      // Try to fetch from TMDB if it's a numeric ID
      const tmdbId = parseInt(seriesId);
      if (!isNaN(tmdbId)) {
        try {
          const tmdbService = await import('../services/tmdbService.js');
          const tmdbSeries = await tmdbService.default.getTVSeriesDetails(tmdbId);
          
          // Save to local database
          series = new Series(tmdbSeries);
          await series.save();
        } catch (tmdbError) {
          return res.status(404).json(
            createErrorResponse('Series not found', 404)
          );
        }
      } else {
        return res.status(404).json(
          createErrorResponse('Series not found', 404)
        );
      }
    }
    
    // Check if already tracking this series
    const existingTracking = await UserSeriesTracking.findOne({ userId, seriesId });
    if (existingTracking) {
      return res.status(409).json(
        createErrorResponse('Series already being tracked', 409, {
          existingTracking
        })
      );
    }
    
    // Create tracking record
    const trackingId = generateTrackingId(userId, seriesId);
    const tracking = new UserSeriesTracking({
      id: trackingId,
      userId,
      seriesId,
      status,
      currentSeason: Math.max(1, parseInt(currentSeason) || 1),
      currentEpisode: Math.max(1, parseInt(currentEpisode) || 1),
      dateAdded: new Date()
    });
    
    await tracking.save();
    
    // Populate series data
    await tracking.populate('seriesId');
    
    res.status(201).json(
      createSuccessResponse(tracking, 'Series added to tracking successfully')
    );
  } catch (error) {
    console.error('Error adding series to tracking:', error);
    res.status(500).json(
      createErrorResponse('Failed to add series to tracking')
    );
  }
});

/**
 * PUT /api/users/:userId/tracking/:seriesId
 * Update tracking progress
 */
router.put('/:userId/tracking/:seriesId', async (req, res) => {
  try {
    const { userId, seriesId } = req.params;
    const { 
      status, 
      currentSeason, 
      currentEpisode, 
      rating, 
      notes,
      lastViewedDate
    } = req.body;
    
    if (!isValidUUID(userId)) {
      return res.status(400).json(
        createErrorResponse('Invalid user ID format', 400)
      );
    }
    
    const updateData = {
      lastUpdated: new Date()
    };
    
    // Validate and set fields
    if (status && ['watching', 'completed', 'pending', 'dropped'].includes(status)) {
      updateData.status = status;
    }
    
    if (currentSeason && !isNaN(parseInt(currentSeason))) {
      updateData.currentSeason = Math.max(1, parseInt(currentSeason));
    }
    
    if (currentEpisode && !isNaN(parseInt(currentEpisode))) {
      updateData.currentEpisode = Math.max(1, parseInt(currentEpisode));
    }
    
    if (rating && !isNaN(parseInt(rating))) {
      const ratingNum = parseInt(rating);
      if (ratingNum >= 1 && ratingNum <= 10) {
        updateData.rating = ratingNum;
      }
    }
    
    if (notes !== undefined) {
      updateData.notes = notes ? notes.trim() : null;
    }
    
    if (lastViewedDate) {
      updateData.lastViewedDate = new Date(lastViewedDate);
    }
    
    const tracking = await UserSeriesTracking.findOneAndUpdate(
      { userId, seriesId },
      updateData,
      { new: true, runValidators: true }
    ).populate('seriesId');
    
    if (!tracking) {
      return res.status(404).json(
        createErrorResponse('Tracking record not found', 404)
      );
    }
    
    res.json(
      createSuccessResponse(tracking, 'Tracking updated successfully')
    );
  } catch (error) {
    console.error('Error updating tracking:', error);
    res.status(500).json(
      createErrorResponse('Failed to update tracking')
    );
  }
});

/**
 * DELETE /api/users/:userId/tracking/:seriesId
 * Remove series from tracking
 */
router.delete('/:userId/tracking/:seriesId', async (req, res) => {
  try {
    const { userId, seriesId } = req.params;
    
    if (!isValidUUID(userId)) {
      return res.status(400).json(
        createErrorResponse('Invalid user ID format', 400)
      );
    }
    
    const tracking = await UserSeriesTracking.findOneAndDelete({ userId, seriesId });
    
    if (!tracking) {
      return res.status(404).json(
        createErrorResponse('Tracking record not found', 404)
      );
    }
    
    res.json(
      createSuccessResponse(null, 'Series removed from tracking successfully')
    );
  } catch (error) {
    console.error('Error removing series from tracking:', error);
    res.status(500).json(
      createErrorResponse('Failed to remove series from tracking')
    );
  }
});

/**
 * GET /api/users/:userId/tracking/stats
 * Get user's tracking statistics
 */
router.get('/:userId/tracking/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!isValidUUID(userId)) {
      return res.status(400).json(
        createErrorResponse('Invalid user ID format', 400)
      );
    }
    
    const stats = await UserSeriesTracking.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statsObj = {
      watching: 0,
      completed: 0,
      pending: 0,
      dropped: 0,
      total: 0
    };
    
    stats.forEach(stat => {
      statsObj[stat._id] = stat.count;
      statsObj.total += stat.count;
    });
    
    // Get recent activity
    const recentActivity = await UserSeriesTracking
      .find({ userId })
      .populate('seriesId', 'title posterUrl')
      .sort({ lastUpdated: -1 })
      .limit(5);
    
    const response = {
      stats: statsObj,
      recentActivity
    };
    
    res.json(
      createSuccessResponse(response, 'Statistics retrieved successfully')
    );
  } catch (error) {
    console.error('Error getting tracking stats:', error);
    res.status(500).json(
      createErrorResponse('Failed to get tracking statistics')
    );
  }
});

export default router;