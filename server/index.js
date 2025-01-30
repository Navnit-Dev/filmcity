const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Log environment variables (for debugging)
console.log('Environment variables loaded:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT || '5000 (default)');

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    process.exit(1);
}

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route imports
const movieRoutes = require('./routes/movieRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const adminRoutes = require('./routes/adminRoutes');

// API Routes with error handling
app.use('/api/movies', (req, res, next) => {
    console.log(`${req.method} request to /api/movies`);
    next();
}, movieRoutes);

app.use('/api/visitors', (req, res, next) => {
    console.log(`${req.method} request to /api/visitors`);
    next();
}, visitorRoutes);

app.use('/api/admin', (req, res, next) => {
    console.log(`${req.method} request to /api/admin`);
    next();
}, adminRoutes);

// Serve admin.html for /admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve static files
app.get('*', (req, res) => {
    // If the request ends with .html, serve it directly
    if (req.url.endsWith('.html')) {
        res.sendFile(path.join(__dirname, 'public', req.url));
    } else {
        // For other routes, serve index.html
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB connection with retry logic
const connectDB = async (retryCount = 0) => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not set');
        }

        console.log('Connecting to MongoDB...');
        
        // Parse MongoDB URI to remove quotes if present
        const mongoURI = process.env.MONGODB_URI.replace(/^"(.*)"$/, '$1');
        console.log('Using MongoDB URI:', mongoURI);

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
            socketTimeoutMS: 45000,
            family: 4, // Force IPv4
            authSource: 'admin', // Specify auth source
            retryWrites: true,
            w: 'majority'
        });
        
        console.log('Connected to MongoDB successfully');
        
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        // Initialize default admin
        try {
            await Admin.initializeDefaultAdmin();
        } catch (err) {
            console.error('Error initializing admin:', err.message);
        }

        return true;
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        
        if (retryCount < 3) {
            console.log(`Retrying connection in 5 seconds... (Attempt ${retryCount + 1} of 3)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return connectDB(retryCount + 1);
        } else {
            console.error('Failed to connect to MongoDB after 3 attempts');
            return false;
        }
    }
};

// Start server and connect to MongoDB
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        const connected = await connectDB();
        if (!connected) {
            throw new Error('Failed to connect to MongoDB');
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Visit http://localhost:${PORT} to access the application`);
            console.log('Default admin credentials:');
            console.log('Username: admin');
            console.log('Password: admin123');
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
};

// Handle server shutdown
process.on('SIGINT', async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err.message);
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    if (err.message) console.error('Error message:', err.message);
    if (err.stack) console.error('Stack trace:', err.stack);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    if (err.message) console.error('Error message:', err.message);
    if (err.stack) console.error('Stack trace:', err.stack);
    if (mongoose.connection.readyState === 1) {
        mongoose.connection.close();
    }
    process.exit(1);
});

startServer();
