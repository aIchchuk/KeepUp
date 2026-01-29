import React from 'react';
import { useCart } from '../context/CartContext';
import Button from './ui/Button';
import '../styles/CartDrawer.css';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cart, cartCount, cartTotal, removeFromCart, clearCart } = useCart();

    if (!isOpen) return null;

    const handleCheckout = () => {
        // For now, let's just alert. In a real app, this would redirect to a checkout page or start payment.
        alert('Checkout feature coming soon! Implementation would involve Khalti multi-payment.');
    };

    return (
        <div className="cart-overlay" onClick={onClose}>
            <div className="cart-drawer" onClick={e => e.stopPropagation()}>
                <div className="cart-header">
                    <h2>Your Cart ({cartCount})</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="cart-items">
                    {cart?.items?.length === 0 ? (
                        <div className="empty-cart">
                            <div className="empty-icon">🛒</div>
                            <p>Your cart is empty</p>
                            <Button variant="primary" onClick={onClose}>Go Shopping</Button>
                        </div>
                    ) : (
                        cart.items.map(item => (
                            <div key={item._id} className="cart-item">
                                <div className="item-info">
                                    <span className="item-title">{item.template.title}</span>
                                    <span className="item-price">${item.template.price || 0}</span>
                                </div>
                                <button
                                    className="remove-item"
                                    onClick={() => removeFromCart(item.template._id)}
                                    aria-label="Remove item"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cart?.items?.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="cart-actions">
                            <Button variant="secondary" onClick={clearCart} style={{ flex: 1 }}>
                                Clear Cart
                            </Button>
                            <Button variant="primary" onClick={handleCheckout} style={{ flex: 2 }}>
                                Checkout
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
