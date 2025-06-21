const express = require('express');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getLandlordProperties,
  assignTenant
} = require('../controllers/property.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProperties);
router.get('/landlord/:id', getLandlordProperties);
router.get('/:id', getProperty);

// Landlord only routes
router.post('/', protect, authorize('landlord', 'admin'), createProperty);
router.put('/:id', protect, authorize('landlord', 'admin'), updateProperty);
router.delete('/:id', protect, authorize('landlord', 'admin'), deleteProperty);
router.post('/:id/assign', protect, authorize('landlord', 'admin'), assignTenant);

module.exports = router;