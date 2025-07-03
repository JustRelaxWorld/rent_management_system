const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for avatars
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const avatarPath = path.join(__dirname, '../../uploads/avatars');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(avatarPath)) {
      fs.mkdirSync(avatarPath, { recursive: true });
    }
    
    cb(null, avatarPath);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with timestamp
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + '_' + file.originalname);
  }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Initialize multer with configuration
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Export both the direct upload object and the middleware function
module.exports = upload;

// Middleware for avatar upload (keeping for backward compatibility)
module.exports.uploadAvatarMiddleware = (req, res, next) => {
  const uploader = upload.single('avatar');
  
  uploader(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
    
    // Everything went fine, proceed
    next();
  });
}; 