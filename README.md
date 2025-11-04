# 🚽 Püper - Your Guide to Relief

Püper is a community-driven platform that helps people find clean, accessible public restrooms along their routes. Your ultimate guide to relief - users can discover, rate, and review restrooms while earning points and badges for their contributions.

## ✨ Features

- **Interactive Map**: Real-time restroom locations with detailed information
- **Community Reviews**: Rate restrooms on cleanliness, lighting, supplies, safety, and accessibility
- **Smart Filters**: Find restrooms by wheelchair accessibility, baby changing stations, gender-neutral options, and more
- **Route Planning**: Discover restrooms along your planned route
- **Geolocation Ranking**: Automatically finds and ranks nearby restrooms based on your current location using the 5-toilet rating system
- **Photo Uploads**: Share photos to help others know what to expect

## 🏗️ Tech Stack

### Web Application
- **React 18** with modern hooks and context
- **React Router** for navigation
- **Framer Motion** for smooth animations
- **Google Maps** for interactive maps
- **React Query** for data fetching and caching
- **Supabase** for backend services (PostgreSQL with PostGIS)

### Mobile Application
- **React Native** with Expo
- **Expo Location** for GPS services
- **React Native Maps** for map integration
- **Supabase** for backend services

### Backend
- **Supabase** (PostgreSQL with PostGIS extension)
- **PostGIS** for geospatial queries
- **RPC Functions** for optimized database operations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (for mobile development)

### Running the Web Application

1. **Navigate to the frontend directory**:
   ```bash
   cd puper/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the `puper/frontend` directory with:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Open your browser**:
   Visit `http://localhost:3000` to view the app.

### Running the Mobile Application

1. **Navigate to the mobile directory**:
   ```bash
   cd PuperMobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Test the app**:
   - Press `i` to open iOS simulator
   - Press `a` to open Android emulator
   - Scan the QR code with Expo Go app on your physical device

## 🗂️ Project Structure

```
.
├── puper/
│   ├── frontend/                 # React web application
│   │   ├── public/              # Static assets
│   │   ├── src/
│   │   │   ├── components/      # Reusable UI components
│   │   │   ├── pages/           # Page components
│   │   │   ├── services/        # API service functions
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── context/         # React context providers
│   │   │   └── styles/          # Global styles and variables
│   │   ├── package.json         # Dependencies and scripts
│   │   └── .env                 # Environment variables
│   └── README.md                # This file
├── PuperMobile/                 # React Native mobile application
│   ├── App.js                   # Main application component
│   ├── app.json                 # Expo configuration
│   ├── package.json             # Dependencies and scripts
│   ├── services/                # API service functions
│   ├── scripts/                 # Utility scripts
│   └── assets/                  # Images and other assets
├── DEPLOYMENT_PLAN.md           # Comprehensive deployment strategy
└── README.md                    # This file
```

## 🏆 Restroom Ranking System

- **5-Toilet Rating**: Unique rating system using toilet emojis instead of stars
- **Location-Based Ranking**: Automatically ranks restrooms by proximity to your current location
- **Comprehensive Reviews**: Detailed ratings for cleanliness, supplies, accessibility, and privacy
- **Community-Driven**: Rankings based on real user experiences and reviews

## 📱 Mobile App Features

### Cross-Platform Support
- **iOS**: Native app with App Store distribution
- **Android**: Native app with Play Store distribution
- **Web**: Progressive Web App (PWA) version

### Native Features
- **GPS Location**: Real-time location tracking
- **Camera Access**: Photo uploads for restroom reviews
- **Push Notifications**: (Future feature) Real-time updates
- **Offline Mode**: (Future feature) Cache data for offline use

## 🔧 Development Workflow

### Web Development
1. Make changes to files in `puper/frontend/src/`
2. The development server will automatically reload
3. View changes in your browser at `http://localhost:3000`

### Mobile Development
1. Make changes to files in `PuperMobile/`
2. The development server will automatically reload
3. View changes in Expo Go app or simulator

### Database Development
1. Access your Supabase dashboard
2. Modify tables, functions, and policies as needed
3. Changes are immediately reflected in both web and mobile apps

## 🎯 Deployment

See `DEPLOYMENT_PLAN.md` for a comprehensive deployment strategy covering:
- Web application deployment (Vercel, Netlify, etc.)
- Mobile application deployment (App Store, Play Store)
- Database setup and configuration
- CI/CD pipeline
- Monitoring and analytics
- Security considerations

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [React Icons](https://react-icons.github.io/react-icons/)
- Maps powered by [Google Maps](https://maps.google.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Mobile framework by [Expo](https://expo.dev/)
- Inspired by the need for accessible public facilities

---

**Made with 💩 for everyone who needs to go!**