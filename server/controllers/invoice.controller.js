const Invoice = require('../models/Invoice');
const Property = require('../models/Property');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    // Build filter object from query parameters
    const filters = {};
    
    if (req.query.status) filters.status = req.query.status;
    if (req.query.due_date_from) filters.due_date_from = req.query.due_date_from;
    if (req.query.due_date_to) filters.due_date_to = req.query.due_date_to;
    
    // Filter based on user role
    if (req.user.role === 'tenant') {
      filters.tenant_id = req.user.id;
    } else if (req.user.role === 'landlord') {
      filters.landlord_id = req.user.id;
    }
    
    const invoices = await Invoice.findAll(filters);
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Check if user has permission to view this invoice
    if (
      req.user.role === 'tenant' && invoice.tenant_id !== req.user.id ||
      req.user.role === 'landlord'
    ) {
      // For landlord, check if they own the property
      const property = await Property.findById(invoice.property_id);
      if (property.landlord_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this invoice'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private (Landlord only)
exports.createInvoice = async (req, res) => {
  try {
    const { tenant_id, property_id, amount, due_date, description } = req.body;
    
    // Check if property exists and belongs to landlord
    const property = await Property.findById(property_id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    if (property.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create invoices for this property'
      });
    }
    
    // Check if tenant exists
    const tenant = await User.findById(tenant_id);
    
    if (!tenant || tenant.role !== 'tenant') {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }
    
    // Create invoice
    const invoice = await Invoice.create({
      tenant_id,
      property_id,
      amount,
      due_date,
      status: 'pending',
      description: description || 'Monthly Rent'
    });
    
    // Create notification for tenant
    await Notification.createInvoiceNotification(invoice, tenant);
    
    res.status(201).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private (Landlord only)
exports.updateInvoice = async (req, res) => {
  try {
    let invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Check if user has permission to update this invoice
    const property = await Property.findById(invoice.property_id);
    
    if (property.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this invoice'
      });
    }
    
    // Update invoice
    const updated = await Invoice.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update invoice'
      });
    }
    
    // Get updated invoice
    invoice = await Invoice.findById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private (Landlord only)
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Check if user has permission to delete this invoice
    const property = await Property.findById(invoice.property_id);
    
    if (property.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this invoice'
      });
    }
    
    // Delete invoice
    await Invoice.delete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get invoices by tenant ID
// @route   GET /api/invoices/tenant/:id
// @access  Private (Admin, Landlord, or Tenant themselves)
exports.getTenantInvoices = async (req, res) => {
  try {
    // Check if tenant exists
    const tenant = await User.findById(req.params.id);
    
    if (!tenant || tenant.role !== 'tenant') {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }
    
    // Check if user has permission to view these invoices
    if (
      req.user.role === 'tenant' && req.user.id !== tenant.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these invoices'
      });
    }
    
    const invoices = await Invoice.findByTenantId(req.params.id);
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error('Get tenant invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get invoices by property ID
// @route   GET /api/invoices/property/:id
// @access  Private (Admin, Landlord who owns the property)
exports.getPropertyInvoices = async (req, res) => {
  try {
    // Check if property exists
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Check if user has permission to view these invoices
    if (
      req.user.role === 'landlord' && property.landlord_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these invoices'
      });
    }
    
    const invoices = await Invoice.findByPropertyId(req.params.id);
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error('Get property invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Generate monthly invoices for all active leases
// @route   POST /api/invoices/generate-monthly
// @access  Private (Admin only)
exports.generateMonthlyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.generateMonthlyInvoices();
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error('Generate monthly invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 