const express = require('express');
const isAuthorized = require('../../modules/isAuthorized');

const OrderService = require('../services/order-service');

const OrderServiceInstance = new OrderService;

const orderRouter = express.Router();

//gets all orders for customer
orderRouter.get('/history/:customerId', isAuthorized, async (req, res, next) => {
    try {
        const response = await OrderServiceInstance.getAllOrders(req.params.customerId);
        res.json(response);
    } catch (err) {
        next(err);
    }
});

//creates order from cart
orderRouter.post('/new/:customerId/:cartId', isAuthorized, async (req, res, next) => {
    try {
        const response = await OrderServiceInstance.createOrder(req.params.customerId, req.params.cartId);
        res.json(response);
    } catch (err) {
        next(err);
    }
});

//gets most recent order
orderRouter.get('/recent/:customerId', isAuthorized, async (req, res, next) => {
    try {
        const response = await OrderServiceInstance.getMostRecentOrder(req.params.customerId);
        res.json(response);
    } catch (err) {
        next(err);
    }
});

//gets single order
orderRouter.get('/single/:customerId/:orderId', isAuthorized, async (req, res, next) => {
    try {
        // cartId becomes orderId when the cart is processed
        const response = await OrderServiceInstance.getSingleOrder(req.params.customerId, req.params.orderId);
        res.json(response);
    } catch (err) {
        next(err);
    }
});

module.exports = orderRouter;
