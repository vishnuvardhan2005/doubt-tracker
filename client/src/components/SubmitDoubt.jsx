import { useState } from 'react';
import { submitDoubt } from '../api';
import { SUBJECTS, PRIORITIES } from '../constants';

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm';

export default function SubmitDoubt() {
  const [userId, setUserId] = useState('');
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!userId.trim() || !question.trim()) {
      setStatus({ type: 'error', message: 'User ID and question are required.' });
      return;
    }

    setSubmitting(true);
    try {
      const doubt = await submitDoubt(userId.trim(), {
        question: question.trim(),
        subject,
        priority,
      });
      setStatus({ type: 'success', message: `Submitted (id: ${doubt.id}).` });
      setQuestion('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">
          Your user ID (temporary)
        </label>
        <input
          className={inputClass}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="student id"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Question</label>
        <textarea
          className={inputClass}
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Subject</label>
          <select
            className={inputClass}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Priority</label>
          <select
            className={inputClass}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit Doubt'}
      </button>

      {status && (
        <p
          className={`text-sm ${
            status.type === 'error' ? 'text-red-600' : 'text-green-700'
          }`}
        >
          {status.message}
        </p>
      )}
    </form>
  );
}
