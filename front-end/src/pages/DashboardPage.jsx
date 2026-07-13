import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import DataTable from '../components/DataTable';
import './CSS/Pages.css';

const CHART_COLORS = ['#10b981', '#38bdf8', '#f59e0b', '#a78bfa', '#f472b6', '#facc15', '#34d399', '#fb7185'];

const currency = (value) =>
  (value ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const percent = (value) => `${(value ?? 0).toFixed(2)}%`;

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    apiService
      .getDashboard()
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Impossible de charger le dashboard.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Chargement du dashboard..." />;

  const portfolios = dashboard?.portfolios ?? [];
  const chartData = portfolios
    .filter((p) => p.totMarketValue > 0)
    .map((p) => ({ name: p.cryptoId, value: p.totMarketValue }));

  const columns = [
    { key: 'cryptoId', header: 'Crypto', render: (row) => row.cryptoId.toUpperCase() },
    { key: 'quantity', header: 'Quantité', align: 'right', render: (row) => row.quantity.toFixed(6) },
    { key: 'avgBuyPrice', header: 'PRU', align: 'right', render: (row) => currency(row.avgBuyPrice) },
    { key: 'currentPrice', header: 'Prix actuel', align: 'right', render: (row) => currency(row.currentPrice) },
    { key: 'totMarketValue', header: 'Valeur', align: 'right', render: (row) => currency(row.totMarketValue) },
    {
      key: 'pAndL',
      header: 'P&L',
      align: 'right',
      render: (row) => (
        <span className={row.pAndL >= 0 ? 'stat-value positive' : 'stat-value negative'} style={{ fontSize: '0.88rem' }}>
          {currency(row.pAndL)} ({percent(row.pAndLPercentage)})
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Vue d'ensemble de votre portefeuille de simulation.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {dashboard && (
        <>
          <div className="stat-grid">
            <div className="stat-tile">
              <div className="stat-label">Cash disponible</div>
              <div className="stat-value">{currency(dashboard.cashBalance)}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-label">Valeur crypto</div>
              <div className="stat-value">{currency(dashboard.totalCryptoValue)}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-label">Valeur nette liquidative</div>
              <div className="stat-value">{currency(dashboard.netLiquidationValue)}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-label">P&L total</div>
              <div className={`stat-value ${dashboard.totalPAndL >= 0 ? 'positive' : 'negative'}`}>
                {currency(dashboard.totalPAndL)}
              </div>
            </div>
            <div className="stat-tile">
              <div className="stat-label">Performance globale</div>
              <div className={`stat-value ${dashboard.earningReturn >= 0 ? 'positive' : 'negative'}`}>
                {percent(dashboard.earningReturn)}
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h2 className="card-title">Positions</h2>
              <DataTable columns={columns} data={portfolios} getRowKey={(row) => row.cryptoId} emptyMessage="Aucune position en portefeuille." />
            </div>

            <div className="card">
              <h2 className="card-title">Répartition du portefeuille</h2>
              {chartData.length === 0 ? (
                <p className="data-table-empty">Aucune position à afficher.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                      {chartData.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }}
                      formatter={(value) => currency(value)}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
