const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://sidah39003:hdHfnouFrZFmXeGg@filmcityadmin.6lojh.mongodb.net/FilmCityAdmin?retryWrites=true&w=majority&appName=FilmCityAdmin")
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Movie Schema
const movieSchema = new mongoose.Schema({
    title: String,
    year: Number,
    category: [String],
    rating: Number,
    description: String,
    posterUrl: String,
    screenshots: [String],
    downloadLinks: {
        type: Map,
        of: String
    }
});

const Movie = mongoose.model('Movie', movieSchema);

// Routes
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json(movie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/movies', async (req, res) => {
    try {
        const movie = new Movie(req.body);
        const savedMovie = await movie.save();
        res.status(201).json(savedMovie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json(movie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Screenshots routes
app.post('/api/movies/:id/screenshots', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        
        const { url } = req.body;
        if (!movie.screenshots) {
            movie.screenshots = [];
        }
        movie.screenshots.push(url);
        await movie.save();
        
        res.json(movie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/movies/:id/screenshots', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        
        const { url } = req.body;
        movie.screenshots = movie.screenshots.filter(s => s !== url);
        await movie.save();
        
        res.json(movie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Quality options routes
app.post('/api/movies/:id/quality', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        
        const { quality, link } = req.body;
        if (!movie.downloadLinks) {
            movie.downloadLinks = new Map();
        }
        movie.downloadLinks.set(quality, link);
        await movie.save();
        
        res.json(movie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/movies/:id/quality/:quality', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        
        movie.downloadLinks.delete(req.params.quality);
        await movie.save();
        
        res.json(movie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
