import { Link } from 'react-router-dom';
export default function NotFound() {
  return <div className="text-center space-y-2">
    <h2 className="text-2xl font-semibold">404</h2>
    <p className="text-gray-600">Page not found.</p>
    <Link to="/" className="underline">Home</Link>
  </div>;
}