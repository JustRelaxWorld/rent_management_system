const express = require('express');
const {
  getMaintenanceRequests,
  getMaintenanceRequest,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  addComment,
  getComments,
  getAvailableProperties
} = require('../controllers/maintenance.controller');

const { protect, authorize } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

const router = express.Router();

// Protected routes
router.use(protect);

// Routes for all authenticated users
router.get('/', getMaintenanceRequests);
router.get('/:id', getMaintenanceRequest);
router.get('/:id/comments', getComments);
router.post('/:id/comments', addComment);

// Tenant only routes
router.post('/', authorize('tenant'), uploadMiddleware.uploadPropertyImage.array('images', 3), createMaintenanceRequest);
router.get('/available-properties', authorize('tenant'), getAvailableProperties);

// Routes for updating maintenance requests (both tenant and landlord)
router.put('/:id', uploadMiddleware.uploadPropertyImage.array('images', 3), updateMaintenanceRequest);

// Admin only routes
router.delete('/:id', authorize('admin'), deleteMaintenanceRequest);

module.exports = router; 