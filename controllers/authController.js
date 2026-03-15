const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const { sendVerificationEmail } = require('../utils/mailer');
const USERS_DB_PATH = path.join(__dirname, '../database/users.json');

// Salt rounds for bcrypt hashing
const SALT_ROUNDS = 10;

/**
 * Read users from JSON database
 * @returns {Promise<Array>} Array of user objects
 */
async function readUsers() {
    try {
        const data = await fs.readFile(USERS_DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

/**
 * Write users to JSON database
 * @param {Array} users - Array of user objects to save
 */
async function writeUsers(users) {
    await fs.mkdir(path.dirname(USERS_DB_PATH), { recursive: true });
    await fs.writeFile(USERS_DB_PATH, JSON.stringify(users, null, 2));
}

/**
 * Register a new user
 * Creates user record and sends verification email
 */
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Read existing users
        const users = await readUsers();

        // Check if email already exists
        const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Check if username already exists
        const existingUsername = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (existingUsername) {
            return res.status(409).json({
                success: false,
                message: 'Username already taken'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Generate verification token
        const verificationToken = uuidv4();

        // Create new user
        const newUser = {
            id: uuidv4(),
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            verified: false,
            verificationToken: verificationToken,
            createdAt: new Date().toISOString()
        };

        // Save user to database
        users.push(newUser);
        await writeUsers(users);

        // Send verification email
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Still return success but warn about email
            return res.status(201).json({
                success: true,
                message: 'Account created but verification email could not be sent. Check server logs.',
                warning: true
            });
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
};

/**
 * Login user
 * Only allows login if email is verified
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Read users
        const users = await readUsers();

        // Find user by email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if email is verified
        if (!user.verified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email first',
                needsVerification: true,
                email: user.email
            });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Return user data (excluding sensitive information)
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

/**
 * Validates verification token and marks user as verified
 */
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }

        // Read users
        const users = await readUsers();

        // Find user by verification token
        const userIndex = users.findIndex(u => u.verificationToken === token);

        if (userIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        // Update user verification status
        users[userIndex].verified = true;
        users[userIndex].verificationToken = null; // Clear token after use
        
        await writeUsers(users);

        res.json({
            success: true,
            message: 'Email verified successfully! You can now log in.'
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed. Please try again.'
        });
    }
};

/**
 * Check if user's email is verified
 * Useful for resending verification emails
 */
exports.checkVerification = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const users = await readUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            verified: user.verified
        });

    } catch (error) {
        console.error('Check verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check verification status'
        });
    }
};