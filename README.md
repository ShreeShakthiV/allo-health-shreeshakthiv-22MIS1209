# Allo Health – Inventory Reservation System

A Next.js application that handles inventory reservations for multi-warehouse retail, preventing overselling through distributed locking.

## Live URL
https://allo-health-shreeshakthiv-22-mis-12.vercel.app

## How to Run Locally

1. Clone the repository:
   git clone https://github.com/ShreeShakthiV/allo-health-shreeshakthiv-22MIS1209.git
   cd allo-health-shreeshakthiv-22MIS1209

2. Install dependencies:
   npm install

3. Set up environment variables — create a .env file:
   DATABASE_URL="your-neon-postgres-url"
   UPSTASH_REDIS_REST_URL="your-upstash-url"
   UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

4. Run database migrations:
   npx prisma db push

5. Seed the database:
   npm run seed

6. Start the dev server:
   npm run dev

7. Open http://localhost:3000

## How Expiry Works in Production
Reservations expire after 10 minutes. Expiry is handled lazily — when a user tries to confirm a reservation, the API checks if expiresAt has passed and returns a 410 Gone response if it has. The stock is released at that point. This avoids the need for a background job while keeping the system correct.

## Concurrency Approach
When two users try to reserve the same product/warehouse simultaneously, a Redis distributed lock (via Upstash) ensures only one request proceeds at a time. The lock is scoped to the product+warehouse combination and expires in 10 seconds. Database transactions are used alongside the lock to guarantee atomic stock updates.

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Prisma + Neon (Postgres)
- Upstash Redis
- Tailwind CSS

## Trade-offs & What I'd Do Differently
- **Expiry**: Used lazy cleanup instead of a cron job. A Vercel Cron job would be cleaner in production to release stock proactively.
- **No auth**: Users are not authenticated. In production each reservation would be tied to a user account.
- **Quantity**: Currently hardcoded to 1 unit per reservation. Would add quantity selection with more time.
- **Error handling**: Basic error handling is in place. Would add more detailed logging and monitoring in production.