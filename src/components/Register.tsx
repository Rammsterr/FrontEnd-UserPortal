import React, { useState } from 'react';
import '../Authform.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, firstName, lastName }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);

                alert('Registrering lyckades!.');

            } else {
                const errorText = await response.text();
                console.error("BackEnd error: ", errorText);
                alert('Registreringen misslyckades.');
            }
        } catch (error) {
            console.error('Något gick fel:', error);
            alert('Något gick fel, testa igen senare.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>Registrera ny användare</h2>
            <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Lösenord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Förnamn"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Efternamn"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
            />
            <button type="submit">Registrera</button>
        </form>
    );
};

export default Register;
