const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for role documents
const roleDocumentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination based on role
    let uploadPath;
    if (req.body.role === 'tenant') {
      uploadPath = path.join(__dirname, '../../uploads/tenant');
    } else if (req.body.role === 'landlord') {
      uploadPath = path.join(__dirname, '../../uploads/landlord');
    } else {
      uploadPath = path.join(__dirname, '../../uploads/other');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with timestamp
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + '_' + file.originalname);
  }
});

// Set up storage for property images
const propertyImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/properties');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with timestamp
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + '_' + file.originalname);
  }
});

// File filter to only accept images
const imageFileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// File filter to accept PDFs and images
const documentFileFilter = (req, file, cb) => {
  // Accept image files and PDF files
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image or PDF files are allowed'), false);
  }
};

// Initialize multer for role document uploads
const uploadRoleDocument = multer({
  storage: roleDocumentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Initialize multer for property image uploads
const uploadPropertyImage = multer({
  storage: propertyImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Export the upload middleware
module.exports = {
  uploadRoleDocument,
  uploadPropertyImage
}; 