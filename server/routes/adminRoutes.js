const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.adminId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt for username:', username);

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const admin = await Admin.findOne({ username: username.toLowerCase() });
        if (!admin) {
            console.log('Admin not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        console.log('Login successful');
        res.json({
            token,
            username: admin.username
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Change credentials route (protected)
router.post('/change-credentials', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newUsername, newPassword } = req.body;
        const admin = await Admin.findById(req.adminId);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        if (newUsername) {
            admin.username = newUsername;
        }
        
        if (newPassword) {
            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters long' });
            }
            admin.password = newPassword;
        }

        await admin.save();
        res.json({ message: 'Credentials updated successfully' });
    } catch (error) {
        console.error('Error changing credentials:', error);
        res.status(500).json({ message: 'Server error while updating credentials' });
    }
});

// Initialize default admin if none exists
router.post('/init', async (req, res) => {
    try {
        console.log('Starting admin initialization...');
        const created = await Admin.initializeDefaultAdmin();
        
        if (created) {
            console.log('Default admin created successfully');
            res.json({ message: 'Default admin created successfully' });
        } else {
            console.log('Admin already exists');
            res.json({ message: 'Admin already exists' });
        }
    } catch (error) {
        console.error('Admin initialization error:', error);
        res.status(500).json({ message: 'Server error during admin initialization' });
    }
});

// Get admin status (for debugging)
router.get('/status', async (req, res) => {
    try {
        const admin = await Admin.findOne();
        res.json({
            exists: !!admin,
            username: admin ? admin.username : null,
            createdAt: admin ? admin.createdAt : null
        });
    } catch (error) {
        console.error('Error getting admin status:', error);
        res.status(500).json({ message: 'Server error while getting admin status' });
    }
});

// Delete all admins (for testing/debugging only)
router.post('/reset', async (req, res) => {
    try {
        await Admin.deleteMany({});
        console.log('All admins deleted');
        res.json({ message: 'All admins deleted' });
    } catch (error) {
        console.error('Error resetting admins:', error);
        res.status(500).json({ message: 'Server error while resetting admins' });
    }
});

module.exports = router;
