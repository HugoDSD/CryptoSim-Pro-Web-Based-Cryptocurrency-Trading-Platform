import { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import DataTable from '../components/DataTable';
import './CSS/Pages.css';

const currency = (value) =>
  (value ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const SORT_OPTIONS = [
  { value: 'nlv', label: 'Valeur nette liquidative' },
  { value: 'cryptovalue', label: 'Valeur crypto' },
  { value: 'activity', label: "Volume d'activité" },
  { value: 'percentage', label: 'Performance (%)' }
];

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState('nlv');
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiService
      .getLeaderboard(sortBy)
      .then((data) => setLeaders(data))
      .catch((err) => setError(err.message || 'Impossible de charger le classement.'))
      .finally(() => setLoading(false));
  }, [sortBy]);

  const handleSortChange = (value) => {
    setLoading(true);
    setSortBy(value);
  };

  const columns = [
    { key: 'classement', header: '#', render: (row) => `#${row.classement}` },
    { key: 'userName', header: 'Utilisateur' },
    { key: 'netLiquidationValue', header: 'Valeur nette', align: 'right', render: (row) => currency(row.netLiquidationValue) },
    { key: 'totalCryptoValue', header: 'Valeur crypto', align: 'right', render: (row) => currency(row.totalCryptoValue) },
    {
      key: 'totalPAndL',
      header: 'P&L',
      align: 'right',
      render: (row) => (
        <span className={row.totalPAndL >= 0 ? 'stat-value positive' : 'stat-value negative'} style={{ fontSize: '0.88rem' }}>
          {currency(row.totalPAndL)}
        </span>
      )
    },
    {
      key: 'earningReturn',
      header: 'Performance',
      align: 'right',
      render: (row) => (
        <span className={row.earningReturn >= 0 ? 'stat-value positive' : 'stat-value negative'} style={{ fontSize: '0.88rem' }}>
          {row.earningReturn.toFixed(2)}%
        </span>
      )
    },
    { key: 'activityVolume', header: 'Activité', align: 'right' }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Classement</h1>
          <p className="page-subtitle">Comparez vos performances à celles des autres traders.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="toolbar">
        <div className="form-group" style={{ minWidth: 240 }}>
          <label>Trier par</label>
          <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Chargement du classement..." />
      ) : (
        <div className="card">
          <DataTable columns={columns} data={leaders} getRowKey={(row) => row.classement} emptyMessage="Aucun utilisateur classé." />
        </div>
      )}
    </div>
  );
}
