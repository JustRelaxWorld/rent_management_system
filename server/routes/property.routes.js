const express = require('express');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getLandlordProperties,
  assignTenant,
  uploadPropertyImages,
  deletePropertyImage
} = require('../controllers/property.controller');

const { protect, authorize } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getProperties);
router.get('/landlord/:id', getLandlordProperties);
router.get('/:id', getProperty);

// Landlord only routes
router.post('/', protect, authorize('landlord', 'admin'), uploadMiddleware.uploadPropertyImage.array('images', 5), createProperty);
router.put('/:id', protect, authorize('landlord', 'admin'), uploadMiddleware.uploadPropertyImage.array('images', 5), updateProperty);
router.delete('/:id', protect, authorize('landlord', 'admin'), deleteProperty);
router.post('/:id/assign', protect, authorize('landlord', 'admin'), assignTenant);

// Property image routes
router.post('/:id/images', protect, authorize('landlord', 'admin'), uploadMiddleware.uploadPropertyImage.array('images', 5), uploadPropertyImages);
router.delete('/:id/images/:imageIndex', protect, authorize('landlord', 'admin'), deletePropertyImage);

module.exports = router;