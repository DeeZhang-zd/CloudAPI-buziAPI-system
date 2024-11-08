const express = require('express');

// Require route modules
const businessesRouter = require('./api/businesses');
const reviewsRouter = require('./api/reviews');
const photosRouter = require('./api/photos');

const usersRouter = require('./api/users');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Route for the home page
app.get('/', (req, res) => {
    res.send('Hello, welcome to our business!');
});

// Use routes for API endpoints
app.use('/api/businesses', businessesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/photos', photosRouter);

app.use('/api/users', usersRouter);

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
