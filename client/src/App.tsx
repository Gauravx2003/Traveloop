import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import type { JSX } from "react";

// A simple protected route wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import MyTrips from "./pages/MyTrips";
import ItineraryBuilder from "./pages/ItineraryBuilder";
import BudgetScreen from "./pages/BudgetScreen";
import PackingChecklist from "./pages/PackingChecklist";
import SharedItinerary from "./pages/SharedItinerary";
import UserProfile from "./pages/UserProfile";
import TripNotes from "./pages/TripNotes";
import Community from "./pages/Community";
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/share/:slug" element={<SharedItinerary />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="create-trip" element={<CreateTrip />} />
            <Route path="my-trips" element={<MyTrips />} />
            <Route path="community" element={<Community />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="trips/:id/itinerary" element={<ItineraryBuilder />} />
            <Route path="trips/:id/budget" element={<BudgetScreen />} />
            <Route path="trips/:id/packing" element={<PackingChecklist />} />
            <Route path="trips/:id/notes" element={<TripNotes />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
