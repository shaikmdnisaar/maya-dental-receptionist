#!/usr/bin/env bash
# Deploy script for Vercel + Neon (PostgreSQL)
# Run this after setting DATABASE_URL to your Neon connection string.
#
# Usage:
#   DATABASE_URL="postgresql://..." bash prisma/deploy.sh

set -e

echo "📦 Swapping to PostgreSQL schema..."
cp prisma/schema-postgres.prisma prisma/schema.prisma

echo "⚙️  Generating Prisma client..."
npx prisma generate

echo "🗄️  Pushing schema to database..."
npx prisma db push

echo "🌱 Seeding demo data..."
npx tsx prisma/seed.ts

echo "✅ Database ready! Now run: vercel --prod"