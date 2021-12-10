const express = require('express');
const isAuthorized = require('../../modules/isAuthorized');

const CartService = require('../services/cart-service');

const CartServiceInstance = new CartService;

const cartRouter = express.Router();

//create new cart for customer
cartRouter.post('/new/:customerId', isAuthorized, async (req, res, next) => {
    try {
        const response = await CartServiceInstance.createCart(req.params.customerId);
        res.json(response);
    } catch (err) {
        next(err);
    }
})

//delete cart (when customer submits order)
cartRouter.delete('/delete/:customerId', isAuthorized, async (req, res, next) => {
    try {
        const response = await CartServiceInstance.deleteCart(req.params.customerId);
        res.json(response);
    } catch (err) {
        next(err);
    }
})

//get all products from cart
cartRouter.get('/products/:customerId/:cartId', isAuthorized, async (req, res, next) => {
    try {
        const response = await CartServiceInstance.getAllProductsFromCart(req.params.customerId, req.params.cartId);
        res.json(response);
    } catch (err) {
        next(err);
    }
});

//add a new product to cart
cartRouter.post('/products/add/:customerId/:cartId/:productId', isAuthorized, async (req, res, next) => {
    try {
        const response = await CartServiceInstance.addNewProductToCart(req.params.customerId, req.params.cartId, req.params.productId);
        res.json(response);
    } catch (err) {
        next(err);
    }
});

//add one to quantity
cartRouter.put('/products/increment/:customerId/:cartId/:productId', isAuthorized, async (req, res, next) => {
    try {
        const response = await CartServiceInstance.changeQuantity(req.params.customerId, req.params.cartId, req.params.productId, 'plus');
        res.json(response);
    } catch (err) {
        next(err);
    }
});

//minus one from quantity
cartRouter.put('/products/decrement/:customerId/:cartId/:productId', isAuthorized, async (req, res, next) => {
    try {
        const response = await CartServiceInstance.changeQuantity(req.params.customerId, req.params.cartId, req.params.productId, 'minus');
        res.json(response);
    } catch (err) {
        next(err);
    }
})

//delete product from cart
cartRouter.delete('/products/delete/:customerId/:cartId/:productId', isAuthorized, async (req, res, next) => {
    try {
        const response = await CartServiceInstance.deleteProductFromCart(req.params.customerId, req.params.cartId, req.params.productId);
        res.json(response);
    } catch (err) {
        next(err);
    }
})

module.exports = cartRouter;