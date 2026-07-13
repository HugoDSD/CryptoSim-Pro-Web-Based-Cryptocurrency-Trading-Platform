import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorMessage, SuccessMessage } from '../components/ErrorMessage';
import './CSS/Pages.css';

const currency = (value) =>
  (value ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

export default function TradingPage() {
  const [searchParams] = useSearchParams();
  const [prices, setPrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    cryptoId: searchParams.get('crypto') || '',
    type: 'BUY',
    quantity: ''
  });

  useEffect(() => {
    apiService
      .getMarketPrices()
      .then((data) => {
        setPrices(data);
        setForm((prev) => ({ cryptoId: prev.cryptoId || data[0]?.id || '', type: prev.type, quantity: prev.quantity }));
      })
      .catch((err) => setError(err.message || 'Impossible de charger les prix.'))
      .finally(() => setLoadingPrices(false));
  }, []);

  const selectedPrice = prices.find((p) => p.id === form.cryptoId);
  const estimatedTotal = selectedPrice ? selectedPrice.currentPrice * Number(form.quantity || 0) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.cryptoId) {
      setError('Veuillez sélectionner une cryptomonnaie.');
      return;
    }
    const quantity = Number(form.quantity);
    if (!quantity || quantity <= 0) {
      setError('La quantité doit être strictement positive.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiService.executeTrade(form.cryptoId, form.type, quantity);
      if (result?.success === false || result?.Success === false) {
        setError(result.message || result.Message || "L'ordre a été refusé.");
      } else {
        setSuccess(result?.message || result?.Message || 'Ordre exécuté avec succès.');
        setForm((prev) => ({ ...prev, quantity: '' }));
      }
    } catch (err) {
      setError(err.message || "Échec de l'exécution de l'ordre.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trading</h1>
          <p className="page-subtitle">Passez un ordre d'achat ou de vente simulé.</p>
        </div>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="card" style={{ maxWidth: 560 }}>
        {loadingPrices ? (
          <LoadingSpinner label="Chargement des cours..." />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Cryptomonnaie</label>
                <select
                  value={form.cryptoId}
                  onChange={(e) => setForm({ ...form, cryptoId: e.target.value })}
                >
                  {prices.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id.toUpperCase()} — {currency(p.currentPrice)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Type d'ordre</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="BUY">Achat (BUY)</option>
                  <option value="SELL">Vente (SELL)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantité</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
            </div>

            {selectedPrice && form.quantity > 0 && (
              <p className="page-subtitle" style={{ marginTop: '1rem' }}>
                Valeur estimée : <strong style={{ color: 'var(--text-primary)' }}>{currency(estimatedTotal)}</strong>
              </p>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1.25rem', width: '100%' }} disabled={submitting}>
              {submitting ? 'Exécution...' : `Passer l'ordre ${form.type === 'BUY' ? "d'achat" : 'de vente'}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
