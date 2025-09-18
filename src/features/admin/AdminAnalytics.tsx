import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const cardStyle: React.CSSProperties = {
  background: 'var(--card-bg, rgba(248,249,255,0.78))',
  border: '1px solid rgba(0,0,0,0.06)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  borderRadius: 12,
  padding: '1rem',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '0.75rem',
};

const kpiValueStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  fontWeight: 800,
  letterSpacing: '0.01em',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  opacity: 0.8,
};

function formatNumber(n: any): string {
  const num = typeof n === 'number' ? n : Number(n);
  if (!isFinite(num)) return String(n);
  return num.toLocaleString('sv-SE');
}

function formatCurrencySEK(n: any): string {
  const num = typeof n === 'number' ? n : Number(n);
  if (!isFinite(num)) return String(n);
  try {
    return num.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 });
  } catch {
    return `${formatNumber(num)} SEK`;
  }
}

const AdminAnalytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [showRaw, setShowRaw] = useState(false);

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

  const kpis = useMemo(() => {
    const a = analytics || {};
    // Heuristics: pick common KPI-like numeric fields if present
    const candidates: Record<string, any> = {
      'Totala intäkter': a.totalRevenue ?? a.revenue ?? a.totalSalesAmount ?? a.totalAmount,
      'Antal orders': a.totalOrders ?? a.orderCount ?? a.orders,
      'Genomsnittligt ordervärde': a.avgOrderValue ?? a.averageOrderValue,
      'Återkommande kunder': a.returningCustomers ?? a.repeatCustomers,
      'Konverteringsgrad (%)': (a.conversionRate ?? a.conversion) != null ? (a.conversionRate ?? a.conversion) * (String(a.conversionRate ?? a.conversion).includes('%') ? 1 : 100) : undefined,
      'Nya kunder': a.newCustomers,
      'Återbetalningar': a.refunds ?? a.refundCount,
    };
    return Object.entries(candidates)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .slice(0, 8);
  }, [analytics]);

  if (!user) return null; // should be redirected already

  return (
    <section>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Admin Analytics</h2>
          <p className="welcome-text" style={{ margin: '0.25rem 0 0 0' }}>Nyckeltal för den aktuella perioden</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn-secondary btn-inline" onClick={() => navigate(-1)}>Tillbaka</button>
          <button className="btn-secondary btn-inline" onClick={() => setShowRaw(v => !v)} aria-expanded={showRaw} aria-controls="raw-json">
            {showRaw ? 'Dölj rådata' : 'Visa rådata'}
          </button>
        </div>
      </header>

      {loading && (
        <div style={{ ...gridStyle }} aria-busy="true" aria-live="polite">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ ...cardStyle, minHeight: 86, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ height: 12, width: '60%', background: 'rgba(0,0,0,0.08)', borderRadius: 6 }} />
              <div style={{ height: 22, width: '40%', background: 'rgba(0,0,0,0.08)', borderRadius: 6 }} />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div role="alert" style={{ ...cardStyle, borderColor: 'rgba(255,0,0,0.2)', background: 'rgba(255,0,0,0.06)', color: 'inherit' }}>
          <strong style={{ color: 'var(--accent, #ff2d95)' }}>Fel:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* KPI grid (if any candidates recognized) */}
          {kpis.length > 0 && (
            <div style={gridStyle}>
              {kpis.map(([label, value]) => {
                const display = label === 'Totala intäkter' ? formatCurrencySEK(value) : formatNumber(value);
                return (
                  <div key={label} style={cardStyle}>
                    <div style={labelStyle}>{label}</div>
                    <div style={kpiValueStyle}>{display}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Generic details: show key-value pairs for top-level analytics entries when not arrays/objects or when small */}
          {analytics && (
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.05rem' }}>Detaljer</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                {Object.entries(analytics as Record<string, any>).map(([key, val]) => {
                  const isPrimitive = val == null || ['string','number','boolean'].includes(typeof val);
                  let display: string;

                  if (isPrimitive) {
                    display = String(val);
                  } else if (Array.isArray(val)) {
                    display = `${val.length} objekt`;
                  } else if (key === 'topProduct' && typeof val === 'object' && val) {
                    const v: any = val;
                    const name = v.name || v.productName || v.title || v.product?.name || v.product?.title || v.sku || v.id;
                    const extra = v.sku && name !== v.sku ? ` (SKU: ${v.sku})` : '';
                    display = name ? `${name}${extra}` : '[produkt]';
                  } else {
                    display = 'objekt';
                  }

                  return (
                    <div key={key} style={{ border: '1px dashed rgba(0,0,0,0.08)', borderRadius: 10, padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{key}</div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>{display}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Raw JSON viewer (collapsible) */}
          {showRaw && (
            <div id="raw-json" style={{ ...cardStyle, overflow: 'auto' }}>
              <pre style={{ margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace' }}>
{JSON.stringify(analytics, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AdminAnalytics;
