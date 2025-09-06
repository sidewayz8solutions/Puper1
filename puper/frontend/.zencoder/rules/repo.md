---
description: Repository Information Overview
alwaysApply: true
---

# Puper Frontend Information

## Summary
Puper is a React-based web and mobile application for finding and rating public restrooms. It integrates with Google Maps API for location services and Supabase for backend functionality. The application includes features like user authentication, restroom discovery, ratings, and a leaderboard system.

## Structure
- **src/**: Main application source code
  - **components/**: Reusable UI components organized by feature
  - **pages/**: Main application views/routes
  - **services/**: API and external service integrations
  - **hooks/**: Custom React hooks
  - **context/**: React context providers
  - **styles/**: Global CSS styles
- **public/**: Static assets and HTML template
- **ios/**: iOS application configuration for Capacitor
- **config/**: Webpack and build configuration
- **scripts/**: Build and development scripts

## Language & Runtime
**Language**: JavaScript (React)
**Version**: React 18.2.0
**Build System**: Webpack 5 with CRACO configuration
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- React 18.2.0 with React DOM and Router
- Google Maps integration (@googlemaps/js-api-loader, @googlemaps/react-wrapper)
- Supabase (@supabase/supabase-js) for backend services
- React Query for data fetching
- Capacitor for mobile app functionality
- Three.js for 3D visualizations
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management

**Development Dependencies**:
- Jest for testing
- ESLint for code linting
- Cross-env for environment variable management
- Autoprefixer and PostCSS for CSS processing

## Build & Installation
```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Mobile Development
**Platform**: iOS via Capacitor
**Configuration**: capacitor.config.json
**App ID**: com.sidewayz8.puper
**Build Directory**: build

## Testing
**Framework**: Jest
**Test Location**: src/**/__tests__/**/*.{js,jsx,ts,tsx}
**Naming Convention**: *.{spec,test}.{js,jsx,ts,tsx}
**Configuration**: Jest configuration in package.json
**Run Command**:
```bash
npm test
```

## Environment Configuration
**Required Variables**:
- REACT_APP_GOOGLE_MAPS_API_KEY: Google Maps API key
- REACT_APP_SUPABASE_URL: Supabase project URL
- REACT_APP_SUPABASE_ANON_KEY: Supabase anonymous key
- REACT_APP_API_URL: Optional backend API URL