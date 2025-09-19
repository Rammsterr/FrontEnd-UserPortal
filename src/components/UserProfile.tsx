import React, { useEffect, useState } from 'react';
import { orderApiBaseUrl } from '../features/orders/orderService';

interface UserProfileData {
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
}

const UserProfile: React.FC = () => {
    const [user, setUser] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editing, setEditing] = useState(false);
    const [firstNameEdit, setFirstNameEdit] = useState('');
    const [lastNameEdit, setLastNameEdit] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Orderhistorik state
    type OrderHistoryItem = {
        id: string;
        createdAt?: string;
        orderDate?: string;
        status?: string;
        totalAmount?: number;
        total?: number;
        currency?: string;
        items?: Array<{ productId?: string; name?: string; productName?: string; quantity?: number; price?: number }>;
    };
    const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    // Hämta profil
    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Du är inte inloggad.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch('/api/users/me', {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Kunde inte hämta användardata');
            const data: UserProfileData = await res.json();
            setUser(data);
            setError(null);
        } catch (e) {
            setError('Något gick fel vid hämtning av profilen.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUser(); }, []);

    // Synka edit-fält när user laddats
    useEffect(() => {
        if (user) {
            setFirstNameEdit(user.firstName ?? '');
            setLastNameEdit(user.lastName ?? '');
        }
    }, [user]);

    // Hämta orderhistorik till profilsidan
    useEffect(() => {
        let aborted = false;
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setOrdersError('Du måste vara inloggad för att se orderhistorik.');
                setOrdersLoading(false);
                return;
            }
            try {
                setOrdersLoading(true);
                setOrdersError(null);
                const res = await fetch(`${orderApiBaseUrl}/api/orders/history`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) {
                    let msg = `Kunde inte hämta orderhistorik (${res.status})`;
                    try { const b = await res.json(); msg = b?.message || b?.error || msg; } catch {}
                    throw new Error(msg);
                }
                const data = await res.json();
                if (aborted) return;
                const arr = Array.isArray(data) ? data
                    : Array.isArray((data as any)?.orders) ? (data as any).orders
                    : Array.isArray((data as any)?.content) ? (data as any).content : [];
                setOrders(arr as OrderHistoryItem[]);
            } catch (e: any) {
                if (!aborted) setOrdersError(e?.message || 'Tekniskt fel vid hämtning.');
            } finally {
                if (!aborted) setOrdersLoading(false);
            }
        };
        fetchOrders();
        return () => { aborted = true; };
    }, []);

    // Spara endast ändrade fält
    const onSave = async () => {
        if (!user) return;
        const token = localStorage.getItem('token');
        if (!token) { setError('Inte inloggad. Logga in igen.'); return; }

        const fn = firstNameEdit.trim();
        const ln = lastNameEdit.trim();

        const payload: Record<string, string> = {};
        if (fn && fn !== user.firstName) payload.firstName = fn;
        if (ln && ln !== user.lastName) payload.lastName = ln;

        if (Object.keys(payload).length === 0) {
            setMessage('Inget att uppdatera.');
            setEditing(false);
            setTimeout(() => setMessage(null), 2000);
            return;
        }

        try {
            setSaving(true);
            setMessage(null);
            const res = await fetch('/api/users/me/settings', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    setError('Sessionen har gått ut. Logga in igen.');
                } else {
                    const t = await res.text();
                    setError(`Kunde inte spara: ${t || res.status}`);
                }
                return;
            }

            // Hämta om från servern (sanning från backend) och stanna kvar
            await fetchUser();
            setEditing(false);
            setMessage('Sparat!');
            setTimeout(() => setMessage(null), 2000);
        } catch {
            setError('Tekniskt fel vid uppdatering.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Laddar användarprofil...</p>;
    if (error)   return <p style={{ color: 'red' }}>{error}</p>;
    if (!user)   return null;

    return (
        <div className="auth-form">
            <h2>Din profil</h2>

            {!editing ? (
                <>
                    <div className="profile-info">
                        <p><strong>Förnamn:</strong> {user.firstName}</p>
                        <p><strong>Efternamn:</strong> {user.lastName}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        {/* Roll/Role is intentionally not displayed in the UI to avoid exposing authorization details.
                            We still fetch it for internal logic (e.g., gating admin features), but do not render it. */}
                        {/* {user.role && <p><strong>Roll:</strong> {user.role}</p>} */}
                    </div>

                    <button className="btn-primary" onClick={() => setEditing(true)}>
                        Redigera
                    </button>
                    {message && <p style={{ marginTop: '0.5rem' }}>{message}</p>}
                </>
            ) : (
                <>
                    <label>Förnamn</label>
                    <input
                        value={firstNameEdit}
                        onChange={(e) => setFirstNameEdit(e.target.value)}
                    />
                    <label>Efternamn</label>
                    <input
                        value={lastNameEdit}
                        onChange={(e) => setLastNameEdit(e.target.value)}
                    />

                    <button
                        className="btn-primary"
                        disabled={saving}
                        onClick={onSave}
                        style={{ marginTop: '0.75rem' }}
                    >
                        {saving ? 'Sparar…' : 'Spara'}
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            setFirstNameEdit(user.firstName);
                            setLastNameEdit(user.lastName);
                            setEditing(false);
                            setMessage(null);
                        }}
                        style={{ marginTop: '0.5rem' }}
                    >
                        Avbryt
                    </button>
                    {message && <p style={{ marginTop: '0.5rem' }}>{message}</p>}
                </>
            )}

            <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid rgba(0,0,0,0.08)' }} />
            <h3>Orderhistorik</h3>
            {ordersLoading ? (
                <p>Laddar…</p>
            ) : ordersError ? (
                <p style={{ color: 'red' }}>{ordersError}</p>
            ) : orders.length === 0 ? (
                <p>Du har inga tidigare ordrar.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                    {orders.map(o => {
                        const iso = o.createdAt || o.orderDate;
                        const d = iso ? new Date(iso) : null;
                        const when = d && !isNaN(d.getTime()) ? d.toLocaleString() : '';
                        const sum = typeof o.totalAmount === 'number' ? o.totalAmount : (typeof o.total === 'number' ? o.total : 0);
                        return (
                            <li key={o.id} style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '0.75rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '0.5rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>Order #{o.id}</div>
                                        <div style={{ opacity: 0.7 }}>{when}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {o.status && <div style={{ fontSize: 12, opacity: 0.8 }}>Status: {o.status}</div>}
                                        <div style={{ fontWeight: 700 }}>{sum.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}</div>
                                    </div>
                                </div>
                                {Array.isArray(o.items) && o.items.length > 0 && (
                                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem', display: 'grid', gap: '0.25rem' }}>
                                        {o.items.map((it, idx) => (
                                            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>
                                                    {it.productName || it.name || it.productId || 'Produkt'}
                                                    {typeof it.quantity === 'number' ? ` × ${it.quantity}` : ''}
                                                </span>
                                                {typeof it.price === 'number' && (
                                                    <span>{(it.price * (it.quantity || 1)).toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default UserProfile;
