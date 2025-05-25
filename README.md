# Series Aggregator

A web application for tracking TV series watching progress without user registration. Built with React, Node.js, MongoDB, and TMDB API integration.

## 🎯 Project Purpose

The Series Aggregator allows users to track and manage their TV series watching progress without requiring account registration. Users can search for series, filter by various criteria, mark episodes as viewed, and maintain watchlists - all while maintaining their data through a unique URL-based session system.

## ✨ Features

### Core Features
- **No Registration Required**: Anonymous access with UUID-based sessions
- **Series Search & Discovery**: Search and filter series by title, genre, platform, and year
- **Progress Tracking**: Mark episodes as viewed and track watching progress
- **Watchlist Management**: Organize series into "Watching", "Completed", and "Pending" lists
- **Platform Integration**: Filter series by streaming platforms (Netflix, HBO Max, Disney+, etc.)
- **TMDB Integration**: Rich series data from The Movie Database

### Technical Features
- **URL-based Sessions**: Each user gets a unique URL to access their data
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Progress updates are saved instantly
- **Search Filters**: Advanced filtering by multiple criteria
- **Statistics Dashboard**: View tracking statistics and recent activity

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **TMDB API** for series data
- **UUID** for user identification

### Frontend
- **React** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Router** for navigation

## 🏗️ Project Structure

```
series-aggregator/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic (TMDB integration)
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Main server file
│   ├── package.json
│   └── .env.example
└── frontend/               # React application
    ├── src/
    │   ├── components/     # React components
    │   ├── pages/          # Page components
    │   ├── contexts/       # React contexts
    │   ├── services/       # API calls
    │   └── utils/          # Helper functions
    ├── package.json
    └── .env.example
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_LOCAL=mongodb://localhost:27017/series-aggregator
   TMDB_API_KEY=your_tmdb_api_key_here
   TMDB_BASE_URL=https://api.themoviedb.org/3
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_NAME="Series Aggregator"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

## 📊 Data Models

### User
- UUID-based identification
- Preferences (theme, default view)
- Creation and last access timestamps

### Series
- TMDB integration with local caching
- Comprehensive metadata (title, description, genres, etc.)
- Season and episode information
- Platform availability

### UserSeriesTracking
- Links users to their tracked series
- Progress tracking (current season/episode)
- Status management (watching, completed, pending, dropped)
- Personal ratings and notes

### Platform
- Streaming platform information
- Logos, colors, and branding
- Active status management

## 🔑 API Endpoints

### Users
- `POST /api/users` - Create or get user
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/:userId/preferences` - Update preferences

### Series
- `GET /api/series/search` - Search TV series
- `GET /api/series/discover` - Discover series with filters
- `GET /api/series/:seriesId` - Get series details
- `GET /api/series/genres` - Get genres list

### Tracking
- `GET /api/users/:userId/tracking` - Get tracking data
- `POST /api/users/:userId/tracking` - Add series to tracking
- `PUT /api/users/:userId/tracking/:seriesId` - Update progress
- `DELETE /api/users/:userId/tracking/:seriesId` - Remove from tracking
- `GET /api/users/:userId/tracking/stats` - Get statistics

## 🔒 Security Features

- **Cryptographically secure UUIDs** for user identification
- **Input sanitization** for all user inputs
- **Rate limiting** on API endpoints (planned)
- **CORS protection** with configurable origins
- **Environment variable protection** for sensitive data

## 📈 Development Status

**Current Phase**: Phase 1 - Project Setup & API Integration (20% Complete)

### ✅ Completed
- [x] TMDB API account setup and endpoint exploration
- [x] Project structure definition
- [x] Backend server setup with Express.js
- [x] MongoDB models and schemas
- [x] Core API endpoints implementation
- [x] TMDB service integration

### 🔄 In Progress
- [ ] Frontend React application setup
- [ ] User interface components
- [ ] State management implementation

### 📋 Next Steps
- [ ] Complete frontend setup with Vite + React + TypeScript
- [ ] Implement user session management
- [ ] Create series search and discovery UI
- [ ] Build tracking functionality
- [ ] Add responsive design and theming

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing comprehensive TV series data
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the fast build tool and development server

---

**Repository**: [github.com/AlexGue/series-aggregator](https://github.com/AlexGue/series-aggregator)
**Author**: Alejandro Guerrero
**Last Updated**: May 25, 2025