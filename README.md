# SUPAWEB

## Tech Stack

1. Remix (with Express server and Vite)
2. Supabase (db & auth)
3. Prisma
4. Tailwind
5. tRPC
6. Lemonsqueezy

## Get started

```sh
git clone https://github.com/Nedi11/supaweb

bun install

bunx supabase start

bun prisma migrate dev

```

Make sure you add the functions on /prisma/postgresql-functions to your supabase project

```sh
bun dev
```

## Start

First, build your app for production:

```sh
bun run build
```

Then run the app in production mode:

```sh
bun start
```

Pick a host to deploy to (railway,fly.io...)
