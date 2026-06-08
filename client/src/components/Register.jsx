import { useState } from 'react';
import { register } from '../api';
import { ROLES } from '../constants';

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm';

export default function Register({ onSwitch }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, role });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Register doesn't log the user in — point them to the login page.
  if (done) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Account created</h2>
        <p className="text-sm text-green-700">
          Your account is ready. You can now log in.
        </p>
        <button
          type="button"
          onClick={onSwitch}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Go to login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-medium">Register</h2>

      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

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
        <label className="mb-1 block text-sm font-medium">
          Password (min 8 chars)
        </label>
        <input
          type="password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Role</label>
        <select
          className={inputClass}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Creating…' : 'Create account'}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-sm text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-blue-700 underline"
        >
          Log in
        </button>
      </p>
    </form>
  );
}
