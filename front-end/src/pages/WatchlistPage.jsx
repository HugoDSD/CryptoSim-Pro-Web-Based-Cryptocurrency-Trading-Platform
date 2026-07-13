import { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorMessage, SuccessMessage } from '../components/ErrorMessage';
import DataTable from '../components/DataTable';
import './CSS/Pages.css';

const currency = (value) =>
  (value ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [allPrices, setAllPrices] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = () => {
    return Promise.all([apiService.getWatchlist(), apiService.getMarketPrices()])
      .then(([watch, prices]) => {
        setWatchlist(watch);
        setAllPrices(prices);
        const watchIds = new Set(watch.map((w) => w.id));
        const firstAvailable = prices.find((p) => !watchIds.has(p.id));
        setSelectedToAdd(firstAvailable?.id || '');
      })
      .catch((err) => setError(err.message || 'Impossible de charger la watchlist.'))
      .finally(() => setLoading(false));
  };

  const load = () => {
    setLoading(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!selectedToAdd) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await apiService.addToWatchlist(selectedToAdd);
      setSuccess(`${selectedToAdd.toUpperCase()} ajouté à la watchlist.`);
      load();
    } catch (err) {
      setError(err.message || "Impossible d'ajouter cette crypto.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (cryptoId) => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await apiService.removeFromWatchlist(cryptoId);
      setSuccess(`${cryptoId.toUpperCase()} retiré de la watchlist.`);
      load();
    } catch (err) {
      setError(err.message || 'Impossible de retirer cette crypto.');
    } finally {
      setBusy(false);
    }
  };

  const watchIds = new Set(watchlist.map((w) => w.id));
  const availableToAdd = allPrices.filter((p) => !watchIds.has(p.id));

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
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <button className="btn btn-danger btn-small" disabled={busy} onClick={() => handleRemove(row.id)}>
          Retirer
        </button>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Watchlist</h1>
          <p className="page-subtitle">Suivez de près vos cryptomonnaies préférées.</p>
        </div>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {loading ? (
        <LoadingSpinner label="Chargement de la watchlist..." />
      ) : (
        <>
          <div className="card">
            <div className="toolbar" style={{ marginBottom: 0 }}>
              <div className="form-group" style={{ minWidth: 220 }}>
                <label>Ajouter une crypto</label>
                <select value={selectedToAdd} onChange={(e) => setSelectedToAdd(e.target.value)} disabled={availableToAdd.length === 0}>
                  {availableToAdd.length === 0 ? (
                    <option value="">Toutes les cryptos sont déjà suivies</option>
                  ) : (
                    availableToAdd.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id.toUpperCase()}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <button className="btn btn-primary" disabled={busy || !selectedToAdd} onClick={handleAdd}>
                Ajouter
              </button>
            </div>
          </div>

          <div className="card">
            <DataTable columns={columns} data={watchlist} getRowKey={(row) => row.id} emptyMessage="Votre watchlist est vide." />
          </div>
        </>
      )}
    </div>
  );
}
