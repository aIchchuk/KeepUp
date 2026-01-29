import React from 'react';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import '../styles/Cart.css';

const Cart = () => {
    const { cart, cartCount, cartTotal, removeFromCart, clearCart } = useCart();

    const handleCheckout = () => {
        alert('Proceeding to checkout with total: $' + cartTotal.toFixed(2));
    };

    return (
        <div className="cart-page-container">
            <div className="cart-page-header">
                <div>
                    <h1>My Cart</h1>
                    <p>Manage your templates before checking out.</p>
                </div>
                {cartCount > 0 && (
                    <Button variant="danger" onClick={clearCart}>
                        Clear All Items
                    </Button>
                )}
            </div>

            {cartCount === 0 ? (
                <div className="empty-cart-state">
                    <div className="empty-cart-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Explore the marketplace and find the perfect template for your next project.</p>
                    <Button variant="primary" onClick={() => window.location.href = '/marketplace'}>
                        Browse Marketplace
                    </Button>
                </div>
            ) : (
                <div className="cart-content-grid">
                    <div className="cart-items-list">
                        {cart?.items?.map(item => (
                            <div key={item._id} className="cart-page-item">
                                <div className="item-preview">
                                    {item.template.structure?.projectSettings?.coverImage ? (
                                        <img src={item.template.structure.projectSettings.coverImage} alt={item.template.title} />
                                    ) : (
                                        <span className="item-emoji">💎</span>
                                    )}
                                </div>
                                <div className="item-details">
                                    <h3>{item.template.title}</h3>
                                    <p>{item.template.description?.substring(0, 100)}...</p>
                                    <div className="item-author">
                                        By {item.template.author?.name || 'KeepUp Expert'}
                                    </div>
                                </div>
                                <div className="item-price-action">
                                    <span className="price">${item.template.price || 0}</span>
                                    <button
                                        className="remove-btn"
                                        onClick={() => removeFromCart(item.template._id)}
                                        title="Remove from cart"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary-card">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal ({cartCount} items)</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Platform Fee</span>
                            <span>$0.00</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <Button variant="primary" onClick={handleCheckout} style={{ width: '100%', marginTop: 'var(--spacing-lg)' }}>
                            Proceed to Checkout
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
