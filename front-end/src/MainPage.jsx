import React from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

export default function MainPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    apiService.logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem', color: '#fff', background: '#0f2f28', minHeight: '100vh' }}>
      <h1>Dashboard CryptoSim Pro</h1>
      <p>Bienvenue sur votre plateforme de simulation de trading.</p>
      <button 
        onClick={handleLogout}
        style={{ padding: '0.8rem 1.5rem', marginTop: '1rem', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        Se déconnecter
      </button>
    </div>
  );
}