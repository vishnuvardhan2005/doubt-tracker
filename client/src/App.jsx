import { useState } from 'react';
import SubmitDoubt from './components/SubmitDoubt';
import MyDoubts from './components/MyDoubts';
import AllDoubts from './components/AllDoubts';

const TABS = [
  { id: 'submit', label: 'Submit Doubt', Component: SubmitDoubt },
  { id: 'mine', label: 'My Doubts', Component: MyDoubts },
  { id: 'all', label: 'All Doubts (Teacher)', Component: AllDoubts },
];

export default function App() {
  const [active, setActive] = useState('submit');
  const { Component } = TABS.find((t) => t.id === active);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-semibold">Doubt Tracker</h1>

      <nav className="mb-6 flex gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-3 py-2 text-sm ${
              active === t.id
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
