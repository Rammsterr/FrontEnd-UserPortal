import React, { useState } from 'react';
import '../Authform.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side check: require confirm password to match
        if (password !== confirmPassword) {
            alert('Lösenorden matchar inte. Vänligen fyll i samma lösenord i båda fälten.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, firstName, lastName }),
            });

            if (response.ok) {
                // Registration succeeded. Do not keep any token here; direct the user to the Login form.
                try {
                    const data = await response.json();
                    // Some backends may return a token here, but our UX requires login afterwards.
                    // Ensure we are logged out and show the Login view.
                    if (data && data.token) {
                        // Clear any token that might have been returned at registration time.
                        localStorage.removeItem('token');
                    }
                } catch {}

                alert('Registrering lyckades! Du kan nu logga in.');

                // Navigate to home and ask AuthSwitch to show the Login form
                window.location.hash = '/';
                window.dispatchEvent(new Event('show-login'));

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
                type="password"
                placeholder="Upprepa lösenord"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
