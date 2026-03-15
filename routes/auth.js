/**
 * Authentication Routes
 * Defines all API endpoints for user authentication
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * POST /api/auth/register
 * Registers a new user and sends verification email
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Authenticates user (only if email is verified)
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/verify
 * Verifies user email via token
 */
router.get('/verify', authController.verifyEmail);

/**
 * GET /api/auth/check-verification
 * Checks if a user's email is verified
 */
router.get('/check-verification', authController.checkVerification);

module.exports = router;