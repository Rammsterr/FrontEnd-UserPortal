import React, { useState } from 'react';

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    firstName,
                    lastName
                }),
            });

            if (response.ok) {
                alert('Registration successful! You can now log in.');
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
        <form onSubmit={handleSubmit}>
            <h2>Registrera ny användare</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <br />
            <button type="submit">Registrera</button>
            <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
            />
            <br />
            <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
            />
            <br />
        </form>
    );
};

export default Register;