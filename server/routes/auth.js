const express = require('express');
const { register, login, getMe } = require('../controllers/auth');
const { protect } = require('../middleware/auth');
<<<<<<< HEAD

const router = express.Router();

router.post('/register', register);
=======
const { uploadRoleDocument } = require('../middleware/upload');

const router = express.Router();

router.post('/register', uploadRoleDocument, register);
>>>>>>> ab58df6 (Initial commit or latest changes)
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router; 