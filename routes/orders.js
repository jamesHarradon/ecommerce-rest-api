const express = require('express');
const pool = require('../db');
const { DateTime } = require('luxon');

const ordersRouter = express.Router();

ordersRouter.param('customerId', async (req, res, next) => {
    try {
        const { customerId } = req.params;
        req.customerId = customerId;
        const exists = await pool.query('SELECT * FROM customers WHERE id = $1', [customerId]);
        if(!exists.rows?.length) {
            const error = new Error(`Customer with id ${customerId} does not exist`);
            error.status = 404;
            throw error;
        };
        req.customer = exists;
        next();
    } catch (err) {
        next(err);
    }
});

ordersRouter.param('cartId', async (req, res, next) => {
    try {
        const { cartId } = req.params;
        req.cartId = cartId;
        const exists = await pool.query('SELECT * FROM carts WHERE id = $1', [cartId]);
        if(!exists.rows?.length) {
            const error = new Error(`Cart with id ${cartId} does not exist`);
            error.status = 404;
            throw error;
        };
        req.cart = exists;
        next();
    } catch (err) {
        next(err);
    }
});

ordersRouter.param('orderId', async (req, res, next) => {
    try {
        const { orderId } = req.params;
        req.orderId = orderId;
        const exists = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if(!exists.rows?.length) {
            const error = new Error(`Order with id ${orderId} does not exist`);
            error.status = 404;
            throw error;
        };
        req.orders = exists;
        next();
    } catch (err) {
        next(err);
    }
});


//create new order (when cart is submitted) creates new order table entry and new orders_products entries
ordersRouter.post('/new/:customerId/:cartId', async (req, res, next) => {
    try {
        const date = DateTime.now().toISODate();
        const newOrder = await pool.query('INSERT INTO orders (customer_id, order_date, total_cost) VALUES ($1, $3, (SELECT total_cost FROM carts WHERE customer_id = $1 AND id = $2)) RETURNING *', [req.customerId, req.cartId, date]);
        const orderId = newOrder.rows[0].id
        await pool.query('INSERT INTO orders_products(order_id, product_id, quantity) SELECT cart_id, product_id, quantity FROM carts_products WHERE cart_id = $1', [req.cartId]);
        await pool.query('UPDATE orders_products SET order_id = $2 WHERE order_id = $1', [req.cartId, orderId]);
        res.json(newOrder.rows[0]);
    } catch (err) {
        next(err);
    }

});

//get most recent order
ordersRouter.get('/recent/:customerId', async (req, res, next) => {
    try {
        const mostRecentOrder = await pool.query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY order_date DESC LIMIT 1', [req.customerId]);
        res.json(mostRecentOrder.rows[0]);
    } catch (err) {
        next(err);
    }
});

//get all customers orders (for order history page)
ordersRouter.get('/:customerId', async (req, res, next) => {
    try {
        const allOrders = await pool.query('SELECT * FROM orders WHERE customer_id = $1', [req.customerId]);
        res.json(allOrders.rows);  
    } catch (err) {
        next(err);
    }  
});

//get a single order by order id (when a previous single order is clicked on to get product data)
ordersRouter.get('/:customerId/:orderId', async (req, res, next) => {
    try {
        const orderById = await pool.query('SELECT product_name, image, price_per_unit, quantity, price_per_unit * quantity AS total_cost FROM orders_products JOIN products ON products.id = orders_products.product_id JOIN orders ON orders.id = orders_products.order_id WHERE order_id = $1 AND orders.customer_id = $2;', [req.orderId, req.customerId]);
        res.json(orderById.rows);
    } catch (err) {
        next(err);
    }
})



module.exports = ordersRouter;