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
    isAuthenticated() {
        return !!this.token;
    }
    getToken() {
        return this.token || localStorage.getItem('token');
    }
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }
    async request(path, { method = 'GET', body } = {}) {
        const isAuthCall = path.startsWith('/Auth/');
        const response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: this.getHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });
        if (response.status === 401 && !isAuthCall) {
            this.setToken(null);
            throw new Error('Your session has expired, please log in again.');
        }
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        if (!response.ok) {
            const message = Array.isArray(data)
                ? data[0]
                : data?.message || data?.Message || 'An error occurred.';
            throw new Error(message);
        }
        return data;
    }
    async register(email, password, name, surname) {
        return this.request('/Auth/register', {
            method: 'POST',
            body: {
                Email: email,
                Password: password,
                Name: name,
                Surname: surname,
            },
        });
    }
    async login(email, password) {
        const data = await this.request('/Auth/login', {
            method: 'POST',
            body: {
                Email: email,
                Password: password,
            },
        });
        this.setToken(data.token);
        return data;
    }
    logout() {
        this.setToken(null);
    }
    getMarketPrices() {
        return this.request('/Market/marketprices');
    }
    getPrice(cryptoId) {
        return this.request(`/Market/price/${cryptoId}`);
    }
    getOhlc(cryptoId, days = 30) {
        return this.request(`/Market/ohlc/${cryptoId}?days=${days}`);
    }
    executeTrade(cryptoId, type, quantity) {
        return this.request('/Trading/execute', {
            method: 'POST',
            body: {
                CryptoId: cryptoId,
                Type: type,
                Quantity: quantity,
            },
        });
    }
    getHistory() {
        return this.request('/Trading/history');
    }
    getDashboard() {
        return this.request('/Trading/dashboard');
    }
    getLeaderboard(sortBy = 'nlv') {
        return this.request(`/Trading/leaderboard?sortBy=${sortBy}`);
    }
    getWatchlist() {
        return this.request('/WatchList/show');
    }
    addToWatchlist(cryptoId) {
        return this.request(`/WatchList/add/${cryptoId}`, {
            method: 'POST',
        });
    }
    removeFromWatchlist(cryptoId) {
        return this.request(`/WatchList/delete/${cryptoId}`, {
            method: 'DELETE',
        });
    }
    getPriceAlerts(onlyActive = false) {
        return this.request(`/PriceAlert/show?onlyActive=${onlyActive}`);
    }
    createPriceAlert(cryptoId, targetPrice, direction, autoExecute = false, orderType = null, orderQuantity = null) {
        return this.request('/PriceAlert/create', {
            method: 'POST',
            body: {
                CryptoId: cryptoId,
                TargetPrice: targetPrice,
                Direction: direction,
                AutoExecute: autoExecute,
                OrderType: autoExecute ? orderType : null,
                OrderQuantity: autoExecute ? orderQuantity : null,
            },
        });
    }
    togglePriceAlert(id) {
        return this.request(`/PriceAlert/toggle/${id}`, {
            method: 'PUT',
        });
    }
    deletePriceAlert(id) {
        return this.request(`/PriceAlert/delete/${id}`, {
            method: 'DELETE',
        });
    }
    getProfile() {
        return this.request('/Profile/show');
    }
    updateProfile(name, surname, email) {
        return this.request('/Profile/update', {
            method: 'PUT',
            body: {
                Name: name,
                Surname: surname,
                Email: email,
            },
        });
    }
    changePassword(currentPassword, newPassword) {
        return this.request('/Profile/change-password', {
            method: 'PUT',
            body: {
                CurrentPassword: currentPassword,
                NewPassword: newPassword,
            },
        });
    }
}
export default new ApiService();
