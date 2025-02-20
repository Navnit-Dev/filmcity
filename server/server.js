const express = require('express');
const mongoose = require('mongoose');
const movie = require('./routes/movies')
const admin = require('./routes/admin')
const adminLogin = require('./routes/auth')
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


//Routes
app.use('/api',movie);
app.use('/api/auth',admin);
app.use('/api/auth',adminLogin);

// Start server
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
