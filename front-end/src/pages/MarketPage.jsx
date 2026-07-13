import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorMessage, SuccessMessage } from '../components/ErrorMessage';
import DataTable from '../components/DataTable';
import './CSS/Pages.css';

const currency = (value) =>
  (value ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const bigNumber = (value) => (value ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 });

export default function MarketPage() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingId, setPendingId] = useState(null);

  const fetchPrices = () => {
    return apiService
      .getMarketPrices()
      .then((data) => setPrices(data))
      .catch((err) => setError(err.message || 'Impossible de charger le marché.'))
      .finally(() => setLoading(false));
  };

  const loadPrices = () => {
    setLoading(true);
    fetchPrices();
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleAddToWatchlist = async (cryptoId) => {
    setError('');
    setSuccess('');
    setPendingId(cryptoId);
    try {
      await apiService.addToWatchlist(cryptoId);
      setSuccess(`${cryptoId.toUpperCase()} ajouté à la watchlist.`);
    } catch (err) {
      setError(err.message || "Impossible d'ajouter à la watchlist.");
    } finally {
      setPendingId(null);
    }
  };

  const columns = [
    { key: 'id', header: 'Crypto', render: (row) => <strong>{row.id.toUpperCase()}</strong> },
    { key: 'currentPrice', header: 'Prix', align: 'right', render: (row) => currency(row.currentPrice) },
    {
      key: 'priceChange24h',
      header: 'Variation 24h',
      align: 'right',
      render: (row) => (
        <span className={row.priceChange24h >= 0 ? 'stat-value positive' : 'stat-value negative'} style={{ fontSize: '0.88rem' }}>
          {row.priceChange24h >= 0 ? '+' : ''}
          {row.priceChange24h.toFixed(2)}%
        </span>
      )
    },
    { key: 'marketCap', header: 'Market Cap', align: 'right', render: (row) => bigNumber(row.marketCap) },
    { key: 'volume24h', header: 'Volume 24h', align: 'right', render: (row) => bigNumber(row.volume24h) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-small"
            disabled={pendingId === row.id}
            onClick={() => handleAddToWatchlist(row.id)}
          >
            + Watchlist
          </button>
          <button className="btn btn-primary btn-small" onClick={() => navigate(`/trading?crypto=${row.id}`)}>
            Trader
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Marché</h1>
          <p className="page-subtitle">Cours actuels des cryptomonnaies disponibles à la simulation.</p>
        </div>
        <button className="btn" onClick={loadPrices}>
          Rafraîchir
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {loading ? (
        <LoadingSpinner label="Chargement du marché..." />
      ) : (
        <div className="card">
          <DataTable columns={columns} data={prices} getRowKey={(row) => row.id} emptyMessage="Aucune donnée de marché disponible." />
        </div>
      )}
    </div>
  );
}
