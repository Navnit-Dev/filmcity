const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const jwt = require('jsonwebtoken');

// Auth middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.adminId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get all movies (public route)
router.get('/', async (req, res) => {
    try {
        console.log('Fetching movies...');
        const movies = await Movie.find().sort({ createdAt: -1 });
        console.log(`Found ${movies.length} movies`);
        res.json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ message: 'Error fetching movies' });
    }
});

// Get single movie by ID (public route)
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json(movie);
    } catch (error) {
        console.error('Error fetching movie:', error);
        res.status(500).json({ message: 'Error fetching movie' });
    }
});

// Add a new movie (protected route)
router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log('Received movie data:', req.body); // Debug log

        const { title, posterUrl, category, downloadLinks } = req.body;

        // Validate required fields
        if (!title || !posterUrl || !category) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['title', 'posterUrl', 'category']
            });
        }

        // Validate download links
        if (!downloadLinks || typeof downloadLinks !== 'object') {
            return res.status(400).json({ 
                message: 'Download links must be an object'
            });
        }

        if (!downloadLinks['720p'] || !downloadLinks['1080p'] || !downloadLinks['1440p']) {
            return res.status(400).json({ 
                message: 'Missing required download links. Must include 720p, 1080p, and 1440p links.',
                required: ['720p', '1080p', '1440p'],
                received: downloadLinks
            });
        }

        // Create and save the movie
        const movie = new Movie({
            title,
            posterUrl,
            category,
            downloadLinks
        });

        console.log('Saving movie:', movie); // Debug log

        await movie.save();
        res.status(201).json(movie);
    } catch (error) {
        console.error('Error adding movie:', error); // Debug log
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Error adding movie' });
    }
});

// Delete a movie (protected route)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({ message: 'Error deleting movie' });
    }
});

module.exports = router;
