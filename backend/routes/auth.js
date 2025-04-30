const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route to register a new user
router.post('/signup', authController.signup);

// Route to login
router.post('/login', authController.login);

// Route to logout
router.get('/logout', authController.logout);

// Route to get current user
router.get('/me', authController.getCurrentUser);

module.exports = router;