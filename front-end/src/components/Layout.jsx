import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './Layout.css';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/market', label: 'Marché' },
  { to: '/trading', label: 'Trading' },
  { to: '/history', label: 'Historique' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/alerts', label: 'Alertes' },
  { to: '/leaderboard', label: 'Classement' }
];

export default function Layout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    apiService.logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="navbar">
        <div className="navbar-brand">CryptoSim Pro</div>

        <button
          className="navbar-toggle"
          aria-label="Ouvrir le menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <button className="navbar-logout" onClick={handleLogout}>
            Se déconnecter
          </button>
        </nav>
      </header>

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}
