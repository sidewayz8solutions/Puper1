# 🚽 Püper - Your Guide to Relief

Püper is a community-driven platform that helps people find clean, accessible public restrooms along their routes. Your ultimate guide to relief - users can discover, rate, and review restrooms while earning points and badges for their contributions.

## ✨ Features

- **Interactive Map**: Real-time restroom locations with detailed information
- **Community Reviews**: Rate restrooms on cleanliness, lighting, supplies, safety, and accessibility
- **Smart Filters**: Find restrooms by wheelchair accessibility, baby changing stations, gender-neutral options, and more
- **Route Planning**: Discover restrooms along your planned route
- **Gamification**: Earn points and badges for contributing to the community
- **Photo Uploads**: Share photos to help others know what to expect

## 🏗️ Tech Stack

### Frontend
- **React 18** with modern hooks and context
- **React Router** for navigation
- **Framer Motion** for smooth animations
- **Leaflet** for interactive maps
- **React Query** for data fetching and caching
- **React Hook Form** for form management
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **PostgreSQL** with PostGIS for geospatial data
- **JWT** authentication
- **Multer** for file uploads
- **Joi** for validation
- **bcryptjs** for password hashing

### Infrastructure
- **Docker** for containerization
- **Nginx** for reverse proxy
- **Redis** for caching (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ with PostGIS extension
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd puper
   ```

2. **Set up the database**
   ```bash
   createdb puper_db
   psql -d puper_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   ```

3. **Backend setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run migrate
   npm run dev
   ```

4. **Frontend setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Add your Google Maps API key
   npm start
   ```

5. **Visit the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🗂️ Project Structure

```
puper/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React context providers
│   │   └── styles/          # Global styles and variables
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Express middleware
│   │   └── utils/           # Utility functions
│   ├── migrations/          # Database migration files
│   └── uploads/             # File upload directory
└── docker-compose.yml       # Docker configuration
```

## 🎮 Gamification System

- **Points**: Earn points for adding restrooms (25pts), writing reviews (10pts)
- **Levels**: Advance levels based on total points earned
- **Badges**: Unlock achievements for various milestones
- **Leaderboard**: Compete with other community members

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [React Icons](https://react-icons.github.io/react-icons/)
- Maps powered by [OpenStreetMap](https://www.openstreetmap.org/)
- Inspired by the need for accessible public facilities

---

**Made with 💩 for everyone who needs to go!**
