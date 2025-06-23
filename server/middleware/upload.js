const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage location and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create the uploads directory if it doesn't exist
    const uploadDir = './uploads';
    
    // Since we can't access req.body before parsing, we need to determine the role from the fieldname
    const isLandlord = file.fieldname === 'ownershipDocument';
    const roleSpecificDir = isLandlord ? 
      `${uploadDir}/landlord` : `${uploadDir}/tenant`;
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    
    if (!fs.existsSync(roleSpecificDir)) {
      fs.mkdirSync(roleSpecificDir);
    }
    
    cb(null, roleSpecificDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp_originalname
    cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`);
  }
});

// File filter to validate document types
const fileFilter = (req, file, cb) => {
  // Allow PDFs, images, and docs
  const allowedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, images, or DOC/DOCX are allowed'), false);
  }
};

// Create multer upload instance with configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create a file upload middleware that accepts both file types
const uploadAnyRoleDocument = upload.fields([
  { name: 'ownershipDocument', maxCount: 1 },
  { name: 'leaseAgreement', maxCount: 1 }
]);

// Generic file upload middleware that works for both roles
const uploadRoleDocument = (req, res, next) => {
  console.log('Starting file upload middleware');
  
  uploadAnyRoleDocument(req, res, (err) => {
    console.log('Files received:', req.files);
    console.log('Form data:', req.body);
    
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      // An unknown error occurred
      console.error('Upload middleware error:', err);
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
    
    // After multer processes the files, we can now check role-specific requirements
    const { role } = req.body;
    console.log('Role from form data:', role);
    
    // Add the file to req.file to maintain compatibility with existing code
    if (role === 'landlord' && req.files && req.files.ownershipDocument) {
      req.file = req.files.ownershipDocument[0];
      console.log('Using ownership document:', req.file.path);
    } else if (role === 'tenant' && req.files && req.files.leaseAgreement) {
      req.file = req.files.leaseAgreement[0];
      console.log('Using lease agreement:', req.file.path);
    } else {
      console.log('No file found for role:', role);
    }
    
    // Everything went fine, proceed
    next();
  });
};

module.exports = {
  uploadRoleDocument
}; 