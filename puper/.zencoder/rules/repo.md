---
description: Repository Information Overview
alwaysApply: true
---

# Püper Information

## Summary
Püper is a community-driven platform that helps people find clean, accessible public restrooms along their routes. Users can discover, rate, and review restrooms while earning points and badges for their contributions. The application features an interactive map, community reviews, smart filters, route planning, gamification, and photo uploads.

## Structure
- **frontend/**: React frontend application with components, pages, services, hooks, and context
- **SUPABASE_GEOSPATIAL_SETUP.md**: Documentation for setting up PostGIS in Supabase
- **SUPABASE_REALTIME_SETUP.md**: Documentation for Supabase realtime features
- **FRONTEND_BACKEND_CONNECTION.md**: Documentation for connecting frontend to backend

## Language & Runtime
**Language**: JavaScript (React)
**Version**: React 18
**Build System**: Custom scripts based on React Scripts
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- React 18.2.0
- React Router DOM 6.30.1
- React Query 3.39.3
- Framer Motion 10.18.0
- @supabase/supabase-js 2.55.0
- @googlemaps/react-wrapper 1.2.0
- React Hook Form 7.48.2
- React Hot Toast 2.4.1
- Zustand 4.4.7
- Capacitor 6.2.1 (for mobile)

**Development Dependencies**:
- Jest 27.4.3 (testing)
- Tailwind CSS 3.4.1
- Cross-env 7.0.3
- Autoprefixer 10.4.21

## Build & Installation
```bash
# Install dependencies
cd frontend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and Google Maps API keys

# Start development server
npm start

# Build for production
npm run build
```

## Testing
**Framework**: Jest
**Test Location**: `frontend/src/**/__tests__/**/*.{js,jsx,ts,tsx}` and `frontend/src/**/*.{spec,test}.{js,jsx,ts,tsx}`
**Configuration**: Jest configuration in package.json
**Run Command**:
```bash
npm test
```

## Backend
The project uses Supabase as a backend service with the following features:
- **Database**: PostgreSQL with PostGIS extension for geospatial data
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for file uploads
- **Functions**: Custom RPC functions for geospatial queries
- **Realtime**: Supabase Realtime for live updates

**Geospatial Features**:
- PostGIS extension for accurate distance calculations
- Custom functions for finding nearby restrooms
- Spatial indexing for efficient queries
- Full-text search with geospatial filtering

**Database Schema**:
- `restrooms` table with lat/lon and PostGIS geometry columns
- `reviews` table for user reviews
- `users` table for user profiles

**API Integration**:
- Google Maps API for mapping and geocoding
- Supabase API for data operations