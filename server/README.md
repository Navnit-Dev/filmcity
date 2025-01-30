# FilmCity Server

This is the backend server for the FilmCity movie application.

## Prerequisites

1. Node.js (v14 or higher)
2. MongoDB (Make sure MongoDB is installed and running locally)

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a .env file with the following content:
```
MONGODB_URI=mongodb://localhost:27017/filmcity
PORT=5000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Public Endpoints
- GET `/api/movies` - Get all movies
- GET `/api/movies/:id` - Get a specific movie

### Protected Endpoints (Requires Basic Auth)
- POST `/api/movies` - Create a new movie
- PUT `/api/movies/:id` - Update a movie
- DELETE `/api/movies/:id` - Delete a movie
- POST `/api/admin/verify` - Verify admin credentials

## Default Admin Credentials
- Username: admin
- Password: admin123
