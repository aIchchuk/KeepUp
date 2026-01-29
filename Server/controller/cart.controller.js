import Cart from "../models/cart.model.js";
import Template from "../models/template.model.js";

// Get user's cart
export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate("items.template");
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        res.json(cart);
    } catch (error) {
        console.error("Get Cart Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Add to cart
export const addToCart = async (req, res) => {
    try {
        const { templateId } = req.body;
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const isAlreadyInCart = cart.items.some(item => item.template.toString() === templateId);
        if (isAlreadyInCart) {
            return res.status(400).json({ message: "Item already in cart" });
        }

        cart.items.push({ template: templateId });
        cart.updatedAt = Date.now();
        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate("items.template");
        res.status(200).json(updatedCart);
    } catch (error) {
        console.error("Add to Cart Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Remove from cart
export const removeFromCart = async (req, res) => {
    try {
        const { templateId } = req.params;
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(item => item.template.toString() !== templateId);
        cart.updatedAt = Date.now();
        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate("items.template");
        res.json(updatedCart);
    } catch (error) {
        console.error("Remove from Cart Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Clear cart
export const clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            cart.updatedAt = Date.now();
            await cart.save();
        }
        res.json({ message: "Cart cleared" });
    } catch (error) {
        console.error("Clear Cart Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
