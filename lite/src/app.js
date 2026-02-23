const express = require('express');
const errorHandler = require('./middleware/error.middleware');
const bookingController = require('./controllers/booking.controller');

const app = express();

app.use(express.json());

// Enhanced API Routes
app.post('/api/bookings/initiate', bookingController.initiate);
app.post('/api/bookings/:bookingId/confirm', bookingController.confirm);
app.post('/api/bookings/:bookingId/cancel', bookingController.cancel);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CineBook Lite (Enhanced) running on port ${PORT}`);
});

module.exports = app;
