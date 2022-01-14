const pool = require("../../db");
const { DateTime } = require('luxon');

class OrderModel {

    getDate() {
        return DateTime.now().toISO();
    }

    async checkExistingOrder(custid, orderid) {
        try {
            const order = await pool.query('SELECT * FROM orders WHERE id = $1 AND customer_id = $2', [orderid, custid]);
            return order.rows?.length ? order.rows[0] : null;
        } catch (err) {
            throw new Error(err);
        }
    };

    async addToOrders(custid, cartid) {
        try {
            const date = this.getDate();
            const newOrder = await pool.query('INSERT INTO orders (customer_id, order_date, total_cost) VALUES ($1, $3, (SELECT total_cost FROM carts WHERE customer_id = $1 AND id = $2)) RETURNING *', [custid, cartid, date]);
            return newOrder.rows?.length ? newOrder.rows[0] : null;
        } catch (err) {
            throw new Error(err);
        }
    }

    async addToOrdersProducts(custid, cartid, orderId) {
        try {
            await pool.query('INSERT INTO orders_products(order_id, product_id, quantity)SELECT (SELECT id FROM orders WHERE id = $1), product_id, quantity FROM carts_products WHERE cart_id = $2', [orderId, cartid]);
            // you cannot use RETURNING * in INSERT with a SELECT!
        } catch (err) {
            throw new Error(err);
        }
    }

    async getMostRecentOrder(custid) {
        try {
            const order = await pool.query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY order_date DESC LIMIT 1', [custid]);
            return order.rows?.length ? order.rows[0] : null;
        } catch (err) {
            throw new Error(err);
        }
    }

    async getAllOrders(custid) {
        try {
            const allOrders = await pool.query('SELECT * FROM orders WHERE customer_id = $1', [custid]);
            return allOrders.rows?.length ? allOrders.rows : null;
        } catch (err) {
            throw new Error(err);
        }
    }

    async getSingleOrder(custid, orderid) {
        try {
            const orderById = await pool.query('SELECT product_name, image, price_per_unit, quantity, price_per_unit * quantity AS total_cost FROM orders_products JOIN products ON products.id = orders_products.product_id JOIN orders ON orders.id = orders_products.order_id WHERE order_id = $1 AND orders.customer_id = $2;', [orderid, custid]);
            return orderById.rows?.length ? orderById.rows[0] : null;
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = OrderModel;