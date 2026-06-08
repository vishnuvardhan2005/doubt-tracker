import { useState } from 'react';
import { logout as apiLogout } from './api';
import Login from './components/Login';
import Register from './components/Register';
import SubmitDoubt from './components/SubmitDoubt';
import MyDoubts from './components/MyDoubts';
import AllDoubts from './components/AllDoubts';

const STUDENT_TABS = [
  { id: 'submit', label: 'Submit Doubt', Component: SubmitDoubt },
  { id: 'mine', label: 'My Doubts', Component: MyDoubts },
];
const TEACHER_TABS = [{ id: 'all', label: 'All Doubts', Component: AllDoubts }];

export default function App() {
  // `user` (from the login response) is the only auth state JS can see — the
  // JWT itself lives in an httpOnly cookie and is unreadable by design.
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [active, setActive] = useState(null);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore — we clear local state regardless.
    }
    setUser(null);
    setActive(null);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md p-6">
        <h1 className="mb-6 text-xl font-semibold">Doubt Tracker</h1>
        {authView === 'login' ? (
          <Login onSuccess={setUser} onSwitch={() => setAuthView('register')} />
        ) : (
          <Register onSwitch={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  const tabs = user.role === 'TEACHER' ? TEACHER_TABS : STUDENT_TABS;
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  const { Component } = current;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Doubt Tracker</h1>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>
            {user.name} ({user.role})
          </span>
          <button
            onClick={handleLogout}
            className="rounded border border-gray-300 px-3 py-1 text-sm font-medium"
          >
            Log out
          </button>
        </div>
      </div>

      <nav className="mb-6 flex gap-2 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-3 py-2 text-sm ${
              current.id === t.id
                ? 'border-b-2 border-blue-600 font-medium text-blue-700'
                : 'text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <Component />
    </div>
  );
}
