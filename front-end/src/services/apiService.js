
const API_BASE_URL = 'http://localhost:5025/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: this.getHeaders()
    });

    if (response.status === 401) {
      this.setToken(null);
      throw new Error('Session expirée, veuillez vous reconnecter.');
    }

    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);

    if (!response.ok) {
      const message = (body && (body.message || body.Message)) || (typeof body === 'string' && body) || 'Une erreur est survenue.';
      throw new Error(message);
    }

    return body;
  }

  // -------- AUTH --------

  async register(email, password, name, surname) {
    const response = await fetch(`${API_BASE_URL}/Auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        Email: email,
        Password: password,
        Name: name,
        Surname: surname
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Inscription échouée');
    }

    return await response.json();
  }

  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        Email: email,
        Password: password
      })
    });

    if (!response.ok) {
      throw new Error('Identifiants incorrects ou connexion échouée');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  logout() {
    this.setToken(null);
  }

  // -------- MARKET --------

  getMarketPrices() {
    return this.request('/Market/marketprices');
  }

  getPrice(cryptoId) {
    return this.request(`/Market/price/${encodeURIComponent(cryptoId)}`);
  }

  // -------- TRADING --------

  executeTrade(cryptoId, type, quantity) {
    return this.request('/Trading/execute', {
      method: 'POST',
      body: JSON.stringify({
        CryptoId: cryptoId,
        Type: type,
        Quantity: quantity
      })
    });
  }

  getHistory() {
    return this.request('/Trading/history');
  }

  getDashboard() {
    return this.request('/Trading/dashboard');
  }

  getLeaderboard(sortBy) {
    const query = sortBy ? `?sortBy=${encodeURIComponent(sortBy)}` : '';
    return this.request(`/Trading/leaderboard${query}`);
  }

  // -------- PRICE ALERTS --------

  getPriceAlerts(onlyActive) {
    const query = onlyActive ? '?onlyActive=true' : '';
    return this.request(`/PriceAlert/show${query}`);
  }

  createPriceAlert(cryptoId, targetPrice, direction) {
    return this.request('/PriceAlert/create', {
      method: 'POST',
      body: JSON.stringify({
        CryptoId: cryptoId,
        TargetPrice: targetPrice,
        Direction: direction
      })
    });
  }

  toggleAlert(id) {
    return this.request(`/PriceAlert/toggle/${id}`, { method: 'PUT' });
  }

  deleteAlert(id) {
    return this.request(`/PriceAlert/delete/${id}`, { method: 'DELETE' });
  }

  // -------- WATCHLIST --------

  getWatchlist() {
    return this.request('/WatchList/show');
  }

  addToWatchlist(cryptoId) {
    return this.request(`/WatchList/add/${encodeURIComponent(cryptoId)}`, { method: 'POST' });
  }

  removeFromWatchlist(cryptoId) {
    return this.request(`/WatchList/delete/${encodeURIComponent(cryptoId)}`, { method: 'DELETE' });
  }
}

export default new ApiService();
