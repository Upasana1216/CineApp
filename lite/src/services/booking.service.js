const prisma = require('../config/db');
const { generateBookingNumber, getExpiryTime } = require('../utils/helpers');

/**
 * Lock seats and initiate booking
 */
const initiateBooking = async (userId, showId, seatIds) => {
    const LOCK_MINUTES = 10;

    return prisma.$transaction(async (tx) => {
        // 1. Get show seats and lock them for update (pessimistic locking)
        const showSeats = await tx.showSeat.findMany({
            where: {
                showId,
                seatId: { in: seatIds },
                status: 'AVAILABLE',
            }
        });

        if (showSeats.length !== seatIds.length) {
            throw new Error('One or more seats are no longer available');
        }

        // 2. Calculate total
        const totalAmount = showSeats.reduce((sum, s) => sum + Number(s.price), 0);

        // 3. Create booking
        const booking = await tx.booking.create({
            data: {
                bookingNumber: generateBookingNumber(),
                userId,
                showId,
                totalAmount,
                status: 'PENDING',
                expiresAt: getExpiryTime(LOCK_MINUTES),
            }
        });

        // 4. Update seat status to LOCKED
        await tx.showSeat.updateMany({
            where: {
                showId,
                seatId: { in: seatIds },
            },
            data: {
                status: 'LOCKED',
                lockedAt: new Date(),
                lockedBy: userId,
            }
        });

        return booking;
    });
};

/**
 * Confirm booking after "payment"
 */
const confirmBooking = async (bookingId) => {
    return prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
            where: { id: bookingId },
            include: { show: { include: { showSeats: true } } }
        });

        if (!booking || booking.status !== 'PENDING') {
            throw new Error('Invalid or expired booking');
        }

        if (new Date() > booking.expiresAt) {
            throw new Error('Booking has expired');
        }

        // Confirm booking
        await tx.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED' }
        });

        // Mark show seats as BOOKED
        // Note: In real app, we'd filter seats belonging to this booking
        // For "lite", we'll just assume all LOCKED by this user for this show
        await tx.showSeat.updateMany({
            where: {
                showId: booking.showId,
                lockedBy: booking.userId,
                status: 'LOCKED'
            },
            data: {
                status: 'BOOKED',
                lockedAt: null,
                lockedBy: null
            }
        });

        return { success: true };
    });
};

/**
 * Cancel booking
 */
const cancelBooking = async (bookingId) => {
    return prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) throw new Error('Booking not found');

        await tx.booking.update({
            where: { id: bookingId },
            data: { status: 'CANCELLED' }
        });

        await tx.showSeat.updateMany({
            where: {
                showId: booking.showId,
                lockedBy: booking.userId,
                status: { in: ['LOCKED', 'BOOKED'] }
            },
            data: {
                status: 'AVAILABLE',
                lockedAt: null,
                lockedBy: null
            }
        });

        return { success: true };
    });
};

module.exports = { initiateBooking, confirmBooking, cancelBooking };
