import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AuthSwitch from './components/AuthSwitch';
import UserProfile from './components/UserProfile';
import './Authform.css';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductList from './features/products/ProductList';
import ProductDetails from './features/products/ProductDetails';
import ProductForm from './features/products/ProductForm';

function App() {
    const token = localStorage.getItem("token");

    return (
        <main className="container" role="main">
            <Router>
                <Header />

                <Routes>
                    <Route path="/" element={token ? (
                        <>
                            <UserProfile />
                            <button
                                className="btn-primary btn-inline"
                                style={{ marginTop: '1rem' }}
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    window.location.reload(); // enkel omdirigering
                                }}
                            >
                                Logga ut
                            </button>
                        </>
                    ) : (
                        <>
                            <AuthSwitch />
                        </>
                    )} />

                    {/* Produkt-routes för kommande Product Service-integration */}
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/admin/products/new" element={<ProductForm />} />
                </Routes>

                <div className="neon-bottom-waves" aria-hidden="true" />
                <Footer />
            </Router>
        </main>
    );
}

export default App;
