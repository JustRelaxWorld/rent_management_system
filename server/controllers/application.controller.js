const RentalApplication = require('../models/RentalApplication');
const Property = require('../models/Property');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Submit a rental application
// @route   POST /api/applications
// @access  Private (Tenant only)
exports.submitApplication = async (req, res) => {
  try {
    const { 
      property_id, 
      move_in_date, 
      monthly_income, 
      employment_status, 
      employer, 
      additional_notes 
    } = req.body;
    
    // Check if property exists
    const property = await Property.findById(property_id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Check if property is available
    if (!property.is_available) {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for rent'
      });
    }
    
    // Check if tenant has already applied for this property
    const existingApplication = await RentalApplication.checkExistingApplication(
      req.user.id,
      property_id
    );
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this property',
        data: existingApplication
      });
    }
    
    // Create application
    const application = await RentalApplication.create({
      property_id,
      tenant_id: req.user.id,
      landlord_id: property.landlord_id,
      move_in_date,
      monthly_income,
      employment_status,
      employer,
      additional_notes
    });
    
    // Create notification for landlord
    try {
      await Notification.create({
        user_id: property.landlord_id,
        title: 'New Rental Application',
        message: `You have received a new rental application for ${property.title}`,
        type: 'application',
        reference_id: application.id
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
      // Continue even if notification creation fails
    }
    
    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all applications for a tenant
// @route   GET /api/applications/tenant
// @access  Private (Tenant only)
exports.getTenantApplications = async (req, res) => {
  try {
    const applications = await RentalApplication.findByTenantId(req.user.id);
    
    // Get property details for each application
    const applicationDetails = await Promise.all(
      applications.map(async (application) => {
        const property = await Property.findById(application.property_id);
        return {
          ...application,
          property: property || { title: 'Unknown Property' }
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applicationDetails
    });
  } catch (error) {
    console.error('Get tenant applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all applications for a landlord
// @route   GET /api/applications/landlord
// @access  Private (Landlord only)
exports.getLandlordApplications = async (req, res) => {
  try {
    console.log(`Getting applications for landlord ID: ${req.user.id}`);
    
    if (req.user.role !== 'landlord') {
      return res.status(403).json({
        success: false,
        message: 'Only landlords can access this endpoint'
      });
    }
    
    const applications = await RentalApplication.getLandlordApplicationsWithDetails(req.user.id);
    console.log(`Found ${applications.length} applications for landlord ID: ${req.user.id}`);
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Get landlord applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get application details
// @route   GET /api/applications/:id
// @access  Private (Tenant, Landlord, Admin)
exports.getApplication = async (req, res) => {
  try {
    const application = await RentalApplication.getApplicationWithDetails(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check if user has permission to view this application
    if (
      req.user.role === 'tenant' && application.tenant_id !== req.user.id ||
      req.user.role === 'landlord' && application.landlord_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this application'
      });
    }
    
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update application status (approve/reject)
// @route   PUT /api/applications/:id/status
// @access  Private (Landlord only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, leaseStartDate, leaseEndDate } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const application = await RentalApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check if user is the landlord for this application
    if (application.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }
    
    // Update application status
    const updated = await RentalApplication.updateStatus(
      req.params.id, 
      status, 
      { leaseStartDate, leaseEndDate }
    );
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update application status'
      });
    }
    
    // Create notification for tenant
    try {
      const property = await Property.findById(application.property_id);
      const statusText = status === 'approved' ? 'approved' : 'rejected';
      
      await Notification.create({
        user_id: application.tenant_id,
        title: `Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
        message: `Your application for ${property.title} has been ${statusText}`,
        type: 'application_update',
        reference_id: application.id
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
      // Continue even if notification creation fails
    }
    
    res.status(200).json({
      success: true,
      data: { id: application.id, status }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get applications for a property
// @route   GET /api/applications/property/:id
// @access  Private (Landlord, Admin)
exports.getPropertyApplications = async (req, res) => {
  try {
    const propertyId = req.params.id;
    
    // Check if property exists and belongs to the landlord
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Check if user is the landlord for this property
    if (req.user.role === 'landlord' && property.landlord_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access applications for this property'
      });
    }
    
    // Get applications for the property
    const applications = await RentalApplication.findByPropertyId(propertyId);
    
    // Get tenant details for each application
    const applicationDetails = await Promise.all(
      applications.map(async (application) => {
        const tenant = await User.findById(application.tenant_id);
        return {
          ...application,
          tenant_name: tenant ? tenant.name : 'Unknown',
          tenant_email: tenant ? tenant.email : '',
          tenant_phone: tenant ? tenant.phone : ''
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applicationDetails
    });
  } catch (error) {
    console.error('Get property applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};