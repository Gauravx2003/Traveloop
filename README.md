# 🌍 Traveloop - Your Ultimate Travel Companion

Traveloop is a comprehensive travel planning and community platform designed to make your journeys seamless, social, and organized. From building detailed itineraries to sharing experiences with a global community, Traveloop is the all-in-one tool for modern travelers.

## 🚀 Key Features

### 🗺️ Trip Planning & Management
- **Intelligent Itinerary Builder**: Create day-by-day plans with integrated global activity suggestions.
- **Smart Discovery**: Explore popular destinations directly from your dashboard and start planning with a single click.
- **Trip Notes & Journaling**: Keep track of memories and important reminders for every trip.
- **Budget Tracking**: Manage your travel expenses with visual highlights.

### 👥 Community & Engagement
- **Forum-style Discussions**: Engage in deep, threaded conversations with infinite nesting support.
- **Location-based Discovery**: Tag your posts with cities and filter the community feed to find destination-specific advice.
- **Interactive Discovery**: View community logs and travel tips for trending cities directly from discovery cards.

### 📊 Admin & Analytics
- **Insightful Dashboard**: Monitor platform growth with real-time KPIs (Total Users, Total Trips).
- **Trend Analysis**: Visualize trip creation patterns over time with interactive charts.
- **User Management**: Comprehensive oversight of the user base for platform administrators.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js with TypeScript
- **Styling**: Tailwind CSS for a modern, responsive UI
- **Icons**: Lucide React
- **Routing**: React Router DOM (v6+)
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt for secure password hashing
- **File Uploads**: Multer for profile and post attachments

## 🚦 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gauravx2003/Traveloop.git
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   # Configure your .env file with DATABASE_URL and JWT_SECRET
   npx drizzle-kit push
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 📈 Recent Updates
- **v1.2.0**: Implemented deep-linking from Dashboard city cards to filtered Community views.
- **v1.1.5**: Added recursive threaded comments and city-based filtering to the Community section.
- **v1.1.0**: Launched Admin Analytics Dashboard with trend charts and KPI cards.
- **v1.0.5**: Enhanced Itinerary Builder with global activity dropdowns and category tagging.

---

Built with ❤️ for travelers everywhere.
