/**
 * Generate a random booking number
 */
const generateBookingNumber = () => {
    return `CB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
};

/**
 * Get timestamp for expiry
 */
const getExpiryTime = (minutes) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};

module.exports = { generateBookingNumber, getExpiryTime };
