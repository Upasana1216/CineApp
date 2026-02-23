const bookingService = require('../services/booking.service');

const initiate = async (req, res, next) => {
    try {
        const { userId, showId, seatIds } = req.body;
        const booking = await bookingService.initiateBooking(userId, showId, seatIds);
        res.status(201).json({ message: 'Seats locked', booking });
    } catch (error) {
        next(error);
    }
};

const confirm = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const result = await bookingService.confirmBooking(Number(bookingId));
        res.json({ message: 'Booking confirmed', result });
    } catch (error) {
        next(error);
    }
};

const cancel = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const result = await bookingService.cancelBooking(Number(bookingId));
        res.json({ message: 'Booking cancelled', result });
    } catch (error) {
        next(error);
    }
};

module.exports = { initiate, confirm, cancel };
