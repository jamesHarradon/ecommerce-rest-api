const express = require('express');
const pool = require('../db');
const { DateTime } = require('luxon');

const ordersRouter = express.Router();


//create new order (when cart is submitted) creates new order table entry and new orders_products entries
ordersRouter.post('/new/:customerId/:cartId', async (req, res) => {
    try {
        const { customerId, cartId } = req.params;
        const date = DateTime.now().toISODate();
        const newOrder = await pool.query('INSERT INTO orders (customer_id, order_date, total_cost) VALUES ($1, $3, (SELECT total_cost FROM carts WHERE customer_id = $1 AND id = $2)) RETURNING *', [customerId, cartId, date]);
        const orderId = newOrder.rows[0].id
        const orderProducts = await pool.query('INSERT INTO orders_products(order_id, product_id, quantity) SELECT cart_id, product_id, quantity FROM carts_products WHERE cart_id = $1', [cartId]);
        const setCorrectOrderId = await pool.query('UPDATE orders_products SET order_id = $2 WHERE order_id = $1', [cartId, orderId]);
        res.json(newOrder.rows[0]);
    } catch (err) {
        console.error(err.message);
    }

});

//get most recent order
ordersRouter.get('/recent/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const mostRecentOrder = await pool.query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY order_date DESC LIMIT 1', [customerId]);
        res.json(mostRecentOrder.rows[0]);
    } catch (err) {
        return res.status(500).send(err);
    }
});

//get all customers orders (for order history page)
ordersRouter.get('/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const allOrders = await pool.query('SELECT * FROM orders WHERE customer_id = $1', [customerId]);
        if (!allOrders.rows?.length) {
            res.json('You have not made any orders');
            return;
        }
    res.json(allOrders.rows);  
    } catch (err) {
        return res.status(500).send(err);
    }  
});

//get a single order by order id (when a previous single order is clicked on to get product data)
ordersRouter.get('/:customerId/:orderId', async (req, res) => {
    try {
        const { customerId, orderId } = req.params;
        const orderById = await pool.query('SELECT product_name, image, price_per_unit, quantity, price_per_unit * quantity AS total_cost FROM products JOIN orders_products ON product_id = orders_products.order_id JOIN orders ON orders_products.order_id = orders.id WHERE orders.customer_id = $1 AND orders_products.order_id = $2', [customerId, orderId]);
        res.json(orderById.rows);
    } catch (err) {
        return res.status(500).send(err);
    }
})



module.exports = ordersRouter;