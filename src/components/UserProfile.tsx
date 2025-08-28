import React, { useEffect, useState } from 'react';

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
            const res = await fetch('http://localhost:8080/me', {
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
            const res = await fetch('http://localhost:8080/me/settings', {
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
                        {user.role && <p><strong>Roll:</strong> {user.role}</p>}
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
        </div>
    );
};

export default UserProfile;
