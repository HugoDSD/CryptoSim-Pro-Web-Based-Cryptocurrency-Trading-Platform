import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import AssetDetail from './pages/AssetDetail';
import Trading from './pages/Trading';
import Portfolio from './pages/Portfolio';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';
import Watchlist from './pages/Watchlist';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import apiService from './services/apiService';
const ProtectedRoute = ({ children }) => {
    return apiService.isAuthenticated() ? children : <Navigate to="/login" replace />;
};
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<LoginPage />} />

                <Route
                    path="/app"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="market" element={<Market />} />
                    <Route path="market/:cryptoId" element={<AssetDetail />} />
                    <Route path="trading" element={<Trading />} />
                    <Route path="portfolio" element={<Portfolio />} />
                    <Route path="history" element={<History />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                    <Route path="watchlist" element={<Watchlist />} />
                    <Route path="alerts" element={<Alerts />} />

                    <Route path="profile" element={<Profile />} />
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
