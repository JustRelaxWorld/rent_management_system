const Maintenance = require('../models/Maintenance');
const Property = require('../models/Property');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all maintenance requests
// @route   GET /api/maintenance
// @access  Private
exports.getMaintenanceRequests = async (req, res) => {
  try {
    // Build filter object from query parameters
    const filters = {};
    
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;
    
    // Filter based on user role
    if (req.user.role === 'tenant') {
      filters.tenant_id = req.user.id;
    } else if (req.user.role === 'landlord') {
      filters.landlord_id = req.user.id;
    }
    
    const requests = await Maintenance.findAll(filters);
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single maintenance request
// @route   GET /api/maintenance/:id
// @access  Private
exports.getMaintenanceRequest = async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    // Check if user has permission to view this request
    if (
      req.user.role === 'tenant' && request.tenant_id !== req.user.id ||
      req.user.role === 'landlord'
    ) {
      // For landlord, check if they own the property
      const property = await Property.findById(request.property_id);
      if (property.landlord_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this maintenance request'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new maintenance request
// @route   POST /api/maintenance
// @access  Private (Tenant only)
exports.createMaintenanceRequest = async (req, res) => {
  try {
    const { property_id, title, description, priority } = req.body;
    
    // Check if property exists
    const property = await Property.findById(property_id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Check if tenant is associated with this property
    // This would require checking leases table, but for simplicity, we'll skip this check
    
    // Create maintenance request
    const request = await Maintenance.create({
      property_id,
      tenant_id: req.user.id,
      title,
      description,
      type: req.body.type || 'other',
      priority: priority || 'medium',
      status: 'pending',
      request_date: new Date()
    });
    
    // Get tenant and landlord info for notification
    const tenant = await User.findById(req.user.id);
    const landlord = await User.findById(property.landlord_id);
    
    // Create notification for landlord
    await Notification.createMaintenanceNotification(request, property, tenant, landlord);
    
    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update maintenance request
// @route   PUT /api/maintenance/:id
// @access  Private (Landlord for status update, Tenant for their own requests)
exports.updateMaintenanceRequest = async (req, res) => {
  try {
    let request = await Maintenance.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    // Get property info
    const property = await Property.findById(request.property_id);
    
    // Check if user has permission to update this request
    if (req.user.role === 'tenant') {
      // Tenants can only update their own requests and cannot change status
      if (request.tenant_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this maintenance request'
        });
      }
      
      // Tenants cannot update status
      if (req.body.status) {
        return res.status(403).json({
          success: false,
          message: 'Tenants cannot update request status'
        });
      }
    } else if (req.user.role === 'landlord') {
      // Landlords can only update requests for their properties
      if (property.landlord_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this maintenance request'
        });
      }
    }
    
    // Update request
    const updated = await Maintenance.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update maintenance request'
      });
    }
    
    // Get updated request
    request = await Maintenance.findById(req.params.id);
    
    // If status was updated by landlord, create notification for tenant
    if (req.body.status && req.user.role === 'landlord') {
      try {
        console.log('Creating notification for tenant...');
        console.log('Request:', request);
        console.log('Property:', property);
        
        const tenant = await User.findById(request.tenant_id);
        console.log('Tenant:', tenant);
        
        const landlord = req.user;
        console.log('Landlord:', landlord);
        
        await Notification.createMaintenanceNotification(request, property, tenant, landlord);
        console.log('Notification created successfully');
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Continue execution even if notification fails
      }
    }
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Update maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete maintenance request
// @route   DELETE /api/maintenance/:id
// @access  Private (Admin only)
exports.deleteMaintenanceRequest = async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    // Only admin can delete maintenance requests
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete maintenance requests'
      });
    }
    
    // Delete request
    await Maintenance.delete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add comment to maintenance request
// @route   POST /api/maintenance/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    
    // Check if request exists
    const request = await Maintenance.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    // Check if user has permission to comment on this request
    if (req.user.role === 'tenant') {
      if (request.tenant_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to comment on this maintenance request'
        });
      }
    } else if (req.user.role === 'landlord') {
      const property = await Property.findById(request.property_id);
      if (property.landlord_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to comment on this maintenance request'
        });
      }
    }
    
    // Add comment
    const newComment = await Maintenance.addComment(req.params.id, req.user.id, comment);
    
    res.status(201).json({
      success: true,
      data: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get comments for maintenance request
// @route   GET /api/maintenance/:id/comments
// @access  Private
exports.getComments = async (req, res) => {
  try {
    // Check if request exists
    const request = await Maintenance.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    // Check if user has permission to view comments
    if (req.user.role === 'tenant') {
      if (request.tenant_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view comments for this maintenance request'
        });
      }
    } else if (req.user.role === 'landlord') {
      const property = await Property.findById(request.property_id);
      if (property.landlord_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view comments for this maintenance request'
        });
      }
    }
    
    // Get comments
    const comments = await Maintenance.getComments(req.params.id);
    
    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 