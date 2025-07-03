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
    // Debug file upload
    console.log('File in request:', req.file);
    console.log('Files in request:', req.files);
    console.log('Request body:', req.body);
    
    // Validate required fields
    const requiredFields = ['title', 'address', 'city', 'rent_amount', 'bedrooms', 'bathrooms'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Add user ID to request body
    req.body.landlord_id = req.user.id;
    
    // Handle image upload if present
    if (req.file) {
      console.log('Image file found:', req.file);
      req.body.image_url = req.file.path.replace(/\\/g, '/'); // Normalize path for Windows
      console.log('Set image_url to:', req.body.image_url);
    } else if (req.files && req.files.length > 0) {
      console.log('Image files found:', req.files);
      req.body.image_url = req.files[0].path.replace(/\\/g, '/'); // Normalize path for Windows
      console.log('Set image_url to:', req.body.image_url);
    } else {
      console.log('No image file found in request');
    }
    
    // Convert is_available to integer (MySQL expects 1 or 0, not true/false)
    if (req.body.is_available !== undefined) {
      req.body.is_available = req.body.is_available === true || req.body.is_available === 'true' ? 1 : 0;
    }
    
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
    
    // Handle image upload if present
    if (req.file) {
      req.body.image_url = req.file.path.replace(/\\/g, '/'); // Normalize path for Windows
    }
    
    // Convert is_available to integer (MySQL expects 1 or 0, not true/false)
    if (req.body.is_available !== undefined) {
      req.body.is_available = req.body.is_available === true || req.body.is_available === 'true' ? 1 : 0;
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
    console.log('GET /api/properties/landlord/:id - Requested landlord ID:', req.params.id);
    
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

// @desc    Upload property images
// @route   POST /api/properties/:id/images
// @access  Private (Landlord only)
exports.uploadPropertyImages = async (req, res) => {
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
        message: 'Not authorized to upload images for this property'
      });
    }
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }
    
    // Process uploaded files
    const imagePaths = req.files.map(file => file.path.replace(/\\/g, '/'));
    
    // Set the first image as the main image_url if it doesn't have one yet
    if (!property.image_url && imagePaths.length > 0) {
      await Property.update(req.params.id, { image_url: imagePaths[0] });
    }
    
    // Update the images array
    const currentImages = property.images || [];
    const updatedImages = [...currentImages, ...imagePaths];
    
    await Property.update(req.params.id, { images: updatedImages });
    
    // Get updated property
    const updatedProperty = await Property.findById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: updatedProperty,
      message: 'Images uploaded successfully'
    });
  } catch (error) {
    console.error('Upload property images error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete property image
// @route   DELETE /api/properties/:id/images/:imageIndex
// @access  Private (Landlord only)
exports.deletePropertyImage = async (req, res) => {
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
        message: 'Not authorized to delete images for this property'
      });
    }
    
    const imageIndex = parseInt(req.params.imageIndex);
    
    // Check if index is valid
    if (isNaN(imageIndex) || imageIndex < 0 || !property.images || imageIndex >= property.images.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image index'
      });
    }
    
    // Get the image path to delete
    const imageToDelete = property.images[imageIndex];
    
    // Check if this is also the main image
    if (property.image_url === imageToDelete) {
      // Reset main image to another image or null
      const newMainImage = property.images.length > 1 ? 
        property.images.find(img => img !== imageToDelete) : null;
      
      await Property.update(req.params.id, { image_url: newMainImage });
    }
    
    // Remove the image from the array
    const updatedImages = [...property.images];
    updatedImages.splice(imageIndex, 1);
    
    await Property.update(req.params.id, { images: updatedImages });
    
    // Delete the file from the server
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '..', '..', imageToDelete);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('Error deleting image file:', fileError);
      // Continue execution even if file deletion fails
    }
    
    // Get updated property
    const updatedProperty = await Property.findById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: updatedProperty,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete property image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 