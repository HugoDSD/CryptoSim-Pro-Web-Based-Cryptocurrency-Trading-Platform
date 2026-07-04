import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './CSS/LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    surname: '',
    email: '',
    password: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await apiService.login(loginForm.email, loginForm.password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Connexion échouée');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { email, password, name, surname } = registerForm;
    if (!email.trim() || !password.trim() || !name.trim() || !surname.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await apiService.register(email, password, name, surname);
      setSuccess('Compte créé avec succès. Vous pouvez maintenant vous connecter.');
      setIsRegistering(false);
    } catch (err) {
      setError(err.message || 'Inscription échouée');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>CryptoSim Pro</h1>
        <p className="subtitle">
          {isRegistering ? 'Créer un compte investisseur' : 'Connectez-vous pour trader'}
        </p>

        {!isRegistering ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Connexion...' : 'Connexion'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                value={registerForm.surname}
                onChange={(e) => setRegisterForm({ ...registerForm, surname: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Inscription...' : 'Créer un compte'}
            </button>
          </form>
        )}

        <p className="switch-link">
          {isRegistering ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
          <button type="button" className="link-btn" onClick={switchMode}>
            {isRegistering ? 'Se connecter' : "S'inscrire"}
          </button>
        </p>
      </div>
    </div>
  );
}