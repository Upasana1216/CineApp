const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    // 1. Create a User
    const user = await prisma.user.create({
        data: { email: 'user@example.com', name: 'John Doe' }
    });

    // 2. Create a Movie
    const movie = await prisma.movie.create({
        data: { title: 'Inception', description: 'A thief who steals corporate secrets...' }
    });

    // 3. Create a Show
    const show = await prisma.show.create({
        data: {
            startTime: new Date(Date.now() + 86400000), // Tomorrow
            movieId: movie.id
        }
    });

    // 4. Create Seats and ShowSeats
    const seats = [];
    for (let i = 1; i <= 5; i++) {
        const seat = await prisma.seat.create({ data: { number: `A${i}` } });
        await prisma.showSeat.create({
            data: {
                showId: show.id,
                seatId: seat.id,
                price: 15.00,
                status: 'AVAILABLE'
            }
        });
    }

    console.log('Seed complete!');
    console.log({ userId: user.id, showId: show.id });
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
