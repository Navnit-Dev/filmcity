const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');

// Track visitor
router.post('/track', async (req, res) => {
    try {
        let visitor = await Visitor.findOne();
        if (!visitor) {
            visitor = new Visitor({ count: 1 });
        } else {
            visitor.count += 1;
            visitor.lastUpdated = Date.now();
        }
        await visitor.save();
        res.status(200).json({ message: 'Visitor tracked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get visitor count
router.get('/count', async (req, res) => {
    try {
        const visitor = await Visitor.findOne();
        res.json({ count: visitor ? visitor.count : 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
