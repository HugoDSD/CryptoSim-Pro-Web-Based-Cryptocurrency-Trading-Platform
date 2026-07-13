import './LoadingSpinner.css';

export default function LoadingSpinner({ label = 'Chargement...' }) {
  return (
    <div className="loading-wrapper">
      <div className="loading-spinner" />
      <p>{label}</p>
    </div>
  );
}
