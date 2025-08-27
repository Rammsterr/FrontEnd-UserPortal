import React, { useEffect, useState } from 'react';

interface UserProfileData {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

const UserProfile = () => {
    const [user, setUser] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Du är inte inloggad.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Kunde inte hämta användardata');
                }

                const data = await response.json();
                setUser(data);
            } catch (err) {
                console.error('Fel vid hämtning:', err);
                setError('Något gick fel vid hämtning av profilen.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    if (loading) return <p>Laddar användarprofil...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!user) return null;

    return (
        <div className="auth-form">
            <h2>Din profil</h2>
            <p><strong>Förnamn:</strong> {user.firstName}</p>
            <p><strong>Efternamn:</strong> {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
        </div>
    );
};

export default UserProfile;
