import React, { useState } from 'react';
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
// import OrderCreatePage from './features/orders/OrderCreatePage';
import CheckoutPage from './features/checkout/CheckoutPage';
import OrdersPage from './features/orders/OrdersPage';
import { CartProvider } from './context/CartContext';
// import CartBadge from './components/Cart/CartBadge';
import Cart from './components/Cart/Cart';

function App() {
    const token = localStorage.getItem("token");
    const [cartOpen, setCartOpen] = useState(false);

    return (
        <CartProvider>
            <main className="container" role="main">
                <Router>
                    <Header onCartClick={() => setCartOpen(true)} />

                    <Cart open={cartOpen} onClose={() => setCartOpen(false)} />

                    <Routes>
                        <Route path="/" element={token ? (
                            <>
                                <ProductList />
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
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/orders" element={<OrdersPage />} />
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
