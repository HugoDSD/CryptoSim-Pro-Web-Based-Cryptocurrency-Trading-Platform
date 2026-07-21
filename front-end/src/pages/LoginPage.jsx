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
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
    });
    const [registerForm, setRegisterForm] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
    });
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!loginForm.email.trim() || !loginForm.password.trim()) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await apiService.login(loginForm.email, loginForm.password);
            navigate('/app');
        } catch (err) {
            setError(err.message || 'Login failed');
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
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await apiService.register(email, password, name, surname);
            setSuccess('Account created successfully. You can now log in.');
            setIsRegistering(false);
        } catch (err) {
            setError(err.message || 'Registration failed');
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
                    {isRegistering ? 'Create an investor account' : 'Log in to start trading'}
                </p>

                {!isRegistering ? (
                    <form onSubmit={handleLoginSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={loginForm.email}
                                onChange={(e) =>
                                    setLoginForm({
                                        ...loginForm,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={loginForm.password}
                                onChange={(e) =>
                                    setLoginForm({
                                        ...loginForm,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {error && <p className="error-message">{error}</p>}
                        {success && <p className="success-message">{success}</p>}

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegisterSubmit}>
                        <div className="form-group">
                            <label>First name</label>
                            <input
                                type="text"
                                value={registerForm.name}
                                onChange={(e) =>
                                    setRegisterForm({
                                        ...registerForm,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Last name</label>
                            <input
                                type="text"
                                value={registerForm.surname}
                                onChange={(e) =>
                                    setRegisterForm({
                                        ...registerForm,
                                        surname: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={registerForm.email}
                                onChange={(e) =>
                                    setRegisterForm({
                                        ...registerForm,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={registerForm.password}
                                onChange={(e) =>
                                    setRegisterForm({
                                        ...registerForm,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>
                )}

                <p className="switch-link">
                    {isRegistering ? 'Already have an account?' : "Don't have an account yet?"}
                    <button type="button" className="link-btn" onClick={switchMode}>
                        {isRegistering ? 'Log in' : 'Sign up'}
                    </button>
                </p>
            </div>
        </div>
    );
}
