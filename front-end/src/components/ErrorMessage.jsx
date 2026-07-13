import './ErrorMessage.css';

export function ErrorMessage({ message }) {
  if (!message) return null;
  return <p className="banner banner-error">{message}</p>;
}

export function SuccessMessage({ message }) {
  if (!message) return null;
  return <p className="banner banner-success">{message}</p>;
}
