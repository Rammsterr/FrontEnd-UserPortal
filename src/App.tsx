import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import UserProfile from './components/UserProfile';
import './Authform.css';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import ProductList from './features/products/ProductList';
import ProductDetails from './features/products/ProductDetails';
import ProductForm from './features/products/ProductForm';
import CheckoutPage from './features/checkout/CheckoutPage';
import OrdersPage from './features/orders/OrdersPage';
import { CartProvider } from './context/CartContext';
// import CartBadge from './components/Cart/CartBadge';
import Cart from './components/Cart/Cart';
import Login from './components/Login/Login';
import Register from './components/Register';

function App() {
    const [cartOpen, setCartOpen] = useState(false);

    return (
        <CartProvider>
            <main className="container" role="main">
                <Router>
                    <Header onCartClick={() => setCartOpen(true)} />

                    <Cart open={cartOpen} onClose={() => setCartOpen(false)} />

                    <Routes>
                        <Route path="/" element={<Home />} />

                        {/* Auth routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Produkt-routes för kommande Product Service-integration */}
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/products/:id" element={<ProductDetails />} />
                        <Route path="/admin/products/new" element={<ProductForm />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/profile" element={<UserProfile />} />
                    </Routes>

                    {/* Background visual layers (purely decorative) */}
                    <div className="bg-gradient" aria-hidden="true" />
                    <div className="particle-field" aria-hidden="true" />
                    <div className="neon-bottom-waves" aria-hidden="true" />
                    <Footer />
                </Router>
            </main>
        </CartProvider>
    );
}

export default App;
