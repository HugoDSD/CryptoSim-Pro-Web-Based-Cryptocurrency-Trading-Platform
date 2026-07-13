import { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorMessage, SuccessMessage } from '../components/ErrorMessage';
import DataTable from '../components/DataTable';
import './CSS/Pages.css';

const currency = (value) =>
  (value ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ cryptoId: '', targetPrice: '', direction: 'ABOVE' });

  const fetchData = () => {
    return Promise.all([apiService.getPriceAlerts(false), apiService.getMarketPrices()])
      .then(([alertList, priceList]) => {
        setAlerts(alertList);
        setPrices(priceList);
        setForm((prev) => ({ ...prev, cryptoId: prev.cryptoId || priceList[0]?.id || '' }));
      })
      .catch((err) => setError(err.message || 'Impossible de charger les alertes.'))
      .finally(() => setLoading(false));
  };

  const load = () => {
    setLoading(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.cryptoId) {
      setError('Veuillez sélectionner une cryptomonnaie.');
      return;
    }
    const targetPrice = Number(form.targetPrice);
    if (!targetPrice || targetPrice <= 0) {
      setError('Le prix cible doit être strictement positif.');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createPriceAlert(form.cryptoId, targetPrice, form.direction);
      setSuccess('Alerte créée avec succès.');
      setForm((prev) => ({ ...prev, targetPrice: '' }));
      load();
    } catch (err) {
      setError(err.message || "Impossible de créer l'alerte.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    setBusyId(id);
    setError('');
    try {
      await apiService.toggleAlert(id);
      load();
    } catch (err) {
      setError(err.message || "Impossible de modifier l'alerte.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    setError('');
    try {
      await apiService.deleteAlert(id);
      setSuccess('Alerte supprimée.');
      load();
    } catch (err) {
      setError(err.message || "Impossible de supprimer l'alerte.");
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { key: 'cryptoId', header: 'Crypto', render: (row) => row.cryptoId.toUpperCase() },
    { key: 'targetPrice', header: 'Prix cible', align: 'right', render: (row) => currency(row.targetPrice) },
    {
      key: 'direction',
      header: 'Condition',
      render: (row) => <span className={`badge ${row.direction === 'ABOVE' ? 'badge-above' : 'badge-below'}`}>{row.direction}</span>
    },
    {
      key: 'isActive',
      header: 'Statut',
      render: (row) => <span className={`badge ${row.isActive ? 'badge-active' : 'badge-inactive'}`}>{row.isActive ? 'Active' : 'Inactive'}</span>
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-small" disabled={busyId === row.id} onClick={() => handleToggle(row.id)}>
            {row.isActive ? 'Désactiver' : 'Activer'}
          </button>
          <button className="btn btn-danger btn-small" disabled={busyId === row.id} onClick={() => handleDelete(row.id)}>
            Supprimer
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Alertes de prix</h1>
          <p className="page-subtitle">Soyez notifié lorsqu'une crypto atteint un seuil défini.</p>
        </div>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {loading ? (
        <LoadingSpinner label="Chargement des alertes..." />
      ) : (
        <>
          <div className="card">
            <h2 className="card-title">Créer une alerte</h2>
            <form onSubmit={handleCreate}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Cryptomonnaie</label>
                  <select value={form.cryptoId} onChange={(e) => setForm({ ...form, cryptoId: e.target.value })}>
                    {prices.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id.toUpperCase()} — {currency(p.currentPrice)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Condition</label>
                  <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}>
                    <option value="ABOVE">Au-dessus de (ABOVE)</option>
                    <option value="BELOW">En dessous de (BELOW)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Prix cible</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={form.targetPrice}
                    onChange={(e) => setForm({ ...form, targetPrice: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Création...' : "Créer l'alerte"}
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <h2 className="card-title">Mes alertes</h2>
            <DataTable columns={columns} data={alerts} getRowKey={(row) => row.id} emptyMessage="Aucune alerte configurée." />
          </div>
        </>
      )}
    </div>
  );
}
