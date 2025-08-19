#!/bin/bash

echo "🚽 Setting up Puper - Your Guide to Relief..."

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Please install Node.js 18+"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL is required but not installed."; exit 1; }

echo "✅ Prerequisites check passed"

# Create database
echo "📄 Setting up database..."
createdb puper_db 2>/dev/null || echo "Database puper_db already exists"
psql -d puper_db -c "CREATE EXTENSION IF NOT EXISTS postgis;" 2>/dev/null

# Setup backend
echo "⚙️ Setting up backend..."
cd backend

# Install dependencies
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cat > .env << EOL
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=puper_db
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=$(openssl rand -base64 32)
EOL
    echo "⚠️  Please update backend/.env with your PostgreSQL password"
fi

# Run migrations
echo "Running database migrations..."
psql -d puper_db -f migrations/001_initial.sql

# Create uploads directory
mkdir -p uploads
touch uploads/.gitkeep

cd ..

# Setup frontend
echo "🎨 Setting up frontend..."
cd frontend

# Install dependencies
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating frontend .env file..."
    cat > .env << EOL
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_api_key_here
EOL
    echo "⚠️  Please add your Google Maps API key to frontend/.env"
fi

cd ..

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with your PostgreSQL password"
echo "2. Add your Google Maps API key to frontend/.env"
echo "3. Start the backend: cd backend && npm run dev"
echo "4. Start the frontend: cd frontend && npm start"
echo "5. Visit http://localhost:3000"
echo ""
echo "🎉 Happy coding!"
