# CineBook Lite Setup Guide

CineBook Lite is a simplified version of the movie ticket booking system, focusing on core booking logic using Node.js, Express, and Prisma.

## Prerequisites

- **Node.js**: v18 or higher
- **PostgreSQL**: A running instance of PostgreSQL
- **Git**: To clone the repository

## Installation Steps

1. **Navigate to the Lite directory**:
   ```bash
   cd lite
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file and fill in your database details.
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the `DATABASE_URL`:
   `DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"`

## Database Setup

1. **Initialize Prisma and the Database**:
   Run the migration command to create the database tables.
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Seed the Database**:
   Populate the database with test data (Movie, User, Show, and Seats).
   ```bash
   node prisma/seed.js
   ```

## Running the Application

1. **Start the development server**:
   ```bash
   npm start
   ```
   The server will run at `http://localhost:3000`.

## Testing the Booking Flow

You can test the core logic using `curl` or Postman.

### 1. Initiate Booking (Lock Seats)
Locks specific seats for a show.
```bash
curl -X POST http://localhost:3000/api/bookings/initiate \
-H "Content-Type: application/json" \
-d '{
  "userId": 1,
  "showId": 1,
  "seatIds": [1, 2]
}'
```

### 2. Confirm Booking
Finalizes the booking (marks seats as BOOKED). Replacement `:id` with the `id` from the initiate response.
```bash
curl -X POST http://localhost:3000/api/bookings/:id/confirm
```

### 3. Cancel Booking
Releases the seats back to AVAILABLE.
```bash
curl -X POST http://localhost:3000/api/bookings/:id/cancel
```

## Key Files to Explore

- `prisma/schema.prisma`: The database models.
- `src/services/booking.service.js`: The core transactional booking logic.
- `src/controllers/booking.controller.js`: The API endpoint logic.
