import { useState } from 'react';
import { login } from '../api';

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm';

export default function Login({ onSuccess, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setSubmitting(true);
    try {
      // On success the server sets the httpOnly cookie; we keep the returned
      // user in memory to drive the UI (role-based views, greeting).
      const { user } = await login({ email: email.trim(), password });
      onSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-medium">Log in</h2>

      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          type="password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Logging in…' : 'Log in'}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-sm text-gray-600">
        No account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-blue-700 underline"
        >
          Register
        </button>
      </p>
    </form>
  );
}
