import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get('/cart');
            setCart(res.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart(null);
        }
    }, [user]);

    const addToCart = async (templateId) => {
        if (!user) return;
        try {
            const res = await api.post('/cart/add', { templateId });
            setCart(res.data);
            return { success: true };
        } catch (error) {
            console.error('Error adding to cart:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to add to cart' };
        }
    };

    const removeFromCart = async (templateId) => {
        if (!user) return;
        try {
            const res = await api.delete(`/cart/remove/${templateId}`);
            setCart(res.data);
            return { success: true };
        } catch (error) {
            console.error('Error removing from cart:', error);
            return { success: false, message: 'Failed to remove from cart' };
        }
    };

    const clearCart = async () => {
        if (!user) return;
        try {
            await api.delete('/cart/clear');
            setCart({ ...cart, items: [] });
            return { success: true };
        } catch (error) {
            console.error('Error clearing cart:', error);
            return { success: false, message: 'Failed to clear cart' };
        }
    };

    const isInCart = (templateId) => {
        return cart?.items?.some(item => (item.template._id || item.template) === templateId);
    };

    const cartCount = cart?.items?.length || 0;
    const cartTotal = cart?.items?.reduce((total, item) => total + (item.template.price || 0), 0) || 0;

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            addToCart,
            removeFromCart,
            clearCart,
            isInCart,
            cartCount,
            cartTotal,
            fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
