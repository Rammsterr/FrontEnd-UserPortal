import React, { useState } from 'react';
import '../../Authform.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('https://userservice.drillbi.se/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username: email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                const token = data.accessToken || data.token || data.jwt || data.id_token;
                if (!token) {
                    console.error('Inloggning svarade utan token-fält', data);
                    alert('Inloggning misslyckades: Ogiltigt svar från servern.');
                    return;
                }
                localStorage.setItem('token', token);
                window.location.reload();
                alert('Inloggning lyckades!');
            } else {
                alert('Fel användarnamn eller lösenord');
            }
        } catch (error) {
            console.error('Något gick fel:', error);
            alert('Kunde inte logga in. Testa igen senare.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>Login</h2>
            <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Lösenord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Logga in</button>
        </form>
    );
};

export default Login;
