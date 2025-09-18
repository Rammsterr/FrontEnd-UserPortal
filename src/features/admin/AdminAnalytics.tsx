import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminAnalytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);

  useEffect(() => {
    // Guard: only admins allowed
    if (!user || user.role !== 'ADMIN') {
      navigate('/not-authorized');
      return;
    }

    const controller = new AbortController();

    fetch('https://orderservice.drillbi.se/analytics/monthly-kpis', {
      headers: { Authorization: `Bearer ${user.token}` },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((data) => setAnalytics(data))
      .catch((e: any) => setError(e?.message || 'Något gick fel'))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [user, navigate]);

  if (!user) return null; // should be redirected already

  return (
    <section>
      <h2>Admin Analytics</h2>
      {loading && <p>Laddar analytics…</p>}
      {error && <p style={{ color: 'var(--color-danger)' }}>Fel: {error}</p>}
      {!loading && !error && (
        <pre style={{ background: 'rgba(0,0,0,0.05)', padding: '1rem', borderRadius: 8, overflow: 'auto' }}>
{JSON.stringify(analytics, null, 2)}
        </pre>
      )}
    </section>
  );
};

export default AdminAnalytics;
