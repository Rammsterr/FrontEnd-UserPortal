
import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (response.ok) {
                const data = await response.json();


                const token = data.accessToken;
                localStorage.setItem('token', token);

                alert('Inloggning lyckades!');

                // Här kan du senare navigera till t.ex. /profile
            } else {
                alert('Fel användarnamn eller lösenord');
            }
        } catch (error) {
            console.error('Något gick fel:', error);
            alert('Kunde inte logga in. Testa igen senare.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button type="submit">Logga in</button>
        </form>
    );
};

export default Login;