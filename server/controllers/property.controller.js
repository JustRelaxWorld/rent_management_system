const Property = require('../models/Property');
const User = require('../models/User');

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    // Build filter object from query parameters
    const filters = {};
    
    if (req.query.city) filters.city = req.query.city;
    if (req.query.type) filters.type = req.query.type;
    if (req.query.is_available) filters.is_available = req.query.is_available === 'true';
    if (req.query.min_rent) filters.min_rent = parseFloat(req.query.min_rent);
    if (req.query.max_rent) filters.max_rent = parseFloat(req.query.max_rent);
    
    // If user is landlord, only show their properties
    if (req.user && req.user.role === 'landlord') {
      filters.landlord_id = req.user.id;
    }
    
    const properties = await Property.findAll(filters);
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Landlord only)
exports.createProperty = async (req, res) => {
  try {
    // Add user ID to request body
    req.body.landlord_id = req.user.id;
    
    // Create property
    const property = await Property.create(req.body);
    
    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Landlord only)
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Make sure user is property owner
    if (property.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }
    
    // Update property
    const updated = await Property.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update property'
      });
    }
    
    // Get updated property
    property = await Property.findById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Landlord only)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Make sure user is property owner
    if (property.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }
    
    // Delete property
    await Property.delete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get properties by landlord ID
// @route   GET /api/properties/landlord/:id
// @access  Public
exports.getLandlordProperties = async (req, res) => {
  try {
    // Check if landlord exists
    const landlord = await User.findById(req.params.id);
    
    if (!landlord || landlord.role !== 'landlord') {
      return res.status(404).json({
        success: false,
        message: 'Landlord not found'
      });
    }
    
    const properties = await Property.findByLandlordId(req.params.id);
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Get landlord properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Assign tenant to property
// @route   POST /api/properties/:id/assign
// @access  Private (Landlord only)
exports.assignTenant = async (req, res) => {
  try {
    const { tenantId, leaseStartDate, leaseEndDate, rentAmount } = req.body;
    
    // Check if property exists
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Make sure user is property owner
    if (property.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign tenants to this property'
      });
    }
    
    // Check if property is available
    if (!property.is_available) {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for lease'
      });
    }
    
    // Check if tenant exists
    const tenant = await User.findById(tenantId);
    
    if (!tenant || tenant.role !== 'tenant') {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }
    
    // Assign tenant to property
    const lease = await Property.assignTenant(
      req.params.id,
      tenantId,
      leaseStartDate,
      leaseEndDate,
      rentAmount || property.rent_amount
    );
    
    res.status(200).json({
      success: true,
      data: lease
    });
  } catch (error) {
    console.error('Assign tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 