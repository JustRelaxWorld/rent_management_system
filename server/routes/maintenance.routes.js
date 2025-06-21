const express = require('express');
const {
  getMaintenanceRequests,
  getMaintenanceRequest,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  addComment,
  getComments
} = require('../controllers/maintenance.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.use(protect);

// Routes for all authenticated users
router.get('/', getMaintenanceRequests);
router.get('/:id', getMaintenanceRequest);
router.get('/:id/comments', getComments);
router.post('/:id/comments', addComment);

// Tenant only routes
router.post('/', authorize('tenant'), createMaintenanceRequest);

// Routes for updating maintenance requests (both tenant and landlord)
router.put('/:id', updateMaintenanceRequest);

// Admin only routes
router.delete('/:id', authorize('admin'), deleteMaintenanceRequest);

module.exports = router; 