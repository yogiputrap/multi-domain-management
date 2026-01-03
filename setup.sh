#!/bin/bash

echo "🚀 IFITB MULTIDOMAIN - Quick Start Setup"
echo "========================================"
echo ""

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL and try again"
    exit 1
fi

echo "✅ PostgreSQL found"
echo ""

# Database setup
echo "🗄️  Setting up database..."
echo "Please ensure your PostgreSQL server is running"
echo "and update the DATABASE_URL in .env file with your credentials"
echo ""
read -p "Press Enter when ready to continue..."

# Push schema
echo ""
echo "📤 Pushing database schema..."
npx prisma db push --skip-generate

if [ $? -ne 0 ]; then
    echo "❌ Database push failed"
    echo "Please check your DATABASE_URL in .env file"
    exit 1
fi

# Seed database
echo ""
echo "🌱 Seeding database with default data..."
node prisma/seed.js

if [ $? -ne 0 ]; then
    echo "❌ Database seeding failed"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Default Credentials:"
echo "   Admin: admin@ifitb.site / Admin@123"
echo "   User:  user@example.com / User@123"
echo ""
echo "🚀 Start the server with: npm run dev"
echo "🌐 Open: http://localhost:3000"
echo ""
