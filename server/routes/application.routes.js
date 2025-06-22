const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { protect, authorize } = require('../middleware/auth');

// Submit a rental application
router.post('/', protect, authorize('tenant'), applicationController.submitApplication);

// Get all applications for a tenant
router.get('/tenant', protect, authorize('tenant'), applicationController.getTenantApplications);

// Get all applications for a landlord
router.get('/landlord', protect, authorize('landlord'), applicationController.getLandlordApplications);

// Get applications for a property
// This specific route must come before the /:id route to avoid conflicts
router.get('/property/:id', protect, authorize('landlord', 'admin'), applicationController.getPropertyApplications);

// Get application details
router.get('/:id', protect, authorize('tenant', 'landlord', 'admin'), applicationController.getApplication);

// Update application status (approve/reject)
router.put('/:id/status', protect, authorize('landlord', 'admin'), applicationController.updateApplicationStatus);

module.exports = router; 