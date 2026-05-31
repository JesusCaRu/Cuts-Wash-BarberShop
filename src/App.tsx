
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from '@/components/Layout';
import Home from '@/pages/Home';
import Booking from '@/pages/Booking';
import Admin from '@/pages/Admin';
import Services from '@/pages/Services';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import CalendarView from '@/pages/Calendar';
import AuthCallback from '@/pages/AuthCallback';
import VirtualTryOn from '@/pages/VirtualTryOn';
import { AuthProvider } from '@/context/AuthContext';
import ContactWidget from '@/components/ContactWidget';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/book" element={<Booking />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/services" element={<Services />} />
                <Route path="/calendar" element={<CalendarView />} />
                <Route path="/virtual-try-on" element={<VirtualTryOn />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Routes>
            </main>
            <Footer />
            <ContactWidget />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
