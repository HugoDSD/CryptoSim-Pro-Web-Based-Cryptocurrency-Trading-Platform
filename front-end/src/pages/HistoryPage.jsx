import { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import DataTable from '../components/DataTable';
import './CSS/Pages.css';

const currency = (value) =>
  (value ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const formatDate = (value) => new Date(value).toLocaleString('fr-FR');

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiService
      .getHistory()
      .then((data) => setHistory(data))
      .catch((err) => setError(err.message || "Impossible de charger l'historique."))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'createdAt', header: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'cryptoId', header: 'Crypto', render: (row) => row.cryptoId.toUpperCase() },
    {
      key: 'type',
      header: 'Type',
      render: (row) => <span className={`badge ${row.type === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>{row.type}</span>
    },
    { key: 'quantity', header: 'Quantité', align: 'right', render: (row) => row.quantity.toFixed(6) },
    { key: 'price', header: 'Prix unitaire', align: 'right', render: (row) => currency(row.price) },
    { key: 'fee', header: 'Frais', align: 'right', render: (row) => currency(row.fee) },
    { key: 'totalValue', header: 'Valeur totale', align: 'right', render: (row) => currency(row.totalValue) }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Historique des transactions</h1>
          <p className="page-subtitle">Retrouvez l'ensemble de vos ordres exécutés.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner label="Chargement de l'historique..." />
      ) : (
        <div className="card">
          <DataTable
            columns={columns}
            data={history}
            getRowKey={(row) => row.id}
            emptyMessage="Aucune transaction pour le moment."
          />
        </div>
      )}
    </div>
  );
}
