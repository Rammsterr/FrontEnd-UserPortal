import React from 'react';
import Login from './components/Login/Login';
import Register from './components/Register';
import './Authform.css'; // Viktigt att importera denna!
import './App.css'; // Behåll om du har global stil

function App() {
    return (
        <div>
            <h1 className="page-title">🛍️ E-commerce Integration</h1>
            <p className="welcome-text">Välkommen! Logga in eller registrera dig för att komma igång.</p>
            <Login />
            <Register />
        </div>
    );
}

export default App;
