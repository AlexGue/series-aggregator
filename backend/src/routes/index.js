import express from 'express';
import usersRouter from './users.js';
import seriesRouter from './series.js';
import trackingRouter from './tracking.js';

const router = express.Router();

// Mount routes
router.use('/users', usersRouter);
router.use('/users', trackingRouter); // tracking routes are under /users/:userId/tracking
router.use('/series', seriesRouter);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Series Aggregator API',
    version: '1.0.0',
    description: 'API for tracking TV series watching progress',
    endpoints: {
      users: {
        'POST /users': 'Create or get user',
        'GET /users/:userId': 'Get user by ID',
        'PUT /users/:userId/preferences': 'Update user preferences'
      },
      series: {
        'GET /series/search': 'Search TV series',
        'GET /series/discover': 'Discover TV series with filters',
        'GET /series/:seriesId': 'Get series details',
        'GET /series/:seriesId/season/:seasonNumber': 'Get season details',
        'GET /series/genres': 'Get TV genres list'
      },
      tracking: {
        'GET /users/:userId/tracking': 'Get user tracking data',
        'POST /users/:userId/tracking': 'Add series to tracking',
        'PUT /users/:userId/tracking/:seriesId': 'Update tracking progress',
        'DELETE /users/:userId/tracking/:seriesId': 'Remove from tracking',
        'GET /users/:userId/tracking/stats': 'Get tracking statistics'
      }
    },
    documentation: 'https://github.com/AlexGue/series-aggregator#api-documentation'
  });
});

export default router;