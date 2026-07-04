
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
}

export default new ApiService();