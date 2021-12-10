const express = require('express');
const pool = require('../db');
const { DateTime } = require('luxon');
const isAuthorized = require('../modules/isAuthorized');


const cartRouter = express.Router();

const updateTotalCost = async (cartId) => {
    return await pool.query('UPDATE carts SET total_cost = (SELECT SUM(price_per_unit * quantity) FROM products JOIN carts_products ON products.id = carts_products.product_id WHERE cart_id = $1) WHERE id = $1 RETURNING total_cost', [cartId]);
};

const deleteProduct = async (cartId, productId) => {
    return await pool.query('DELETE FROM carts_products WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
}

cartRouter.param('customerId', isAuthorized, async (req, res, next) => {
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

cartRouter.param('cartId', isAuthorized, async (req, res, next) => {
    try {
        const { cartId } = req.params;
        req.cartId = cartId;
        const exists = await pool.query('SELECT * FROM carts WHERE id = (SELECT id FROM carts WHERE customer_id = $1', [req.customerId]);
        if(!exists.rows?.length) {
            const error = new Error(`Cart for customer id ${req.customerId} does not exist`);
            error.status = 404;
            throw error;
        };
        req.cart = exists;
        next();
    } catch (err) {
        next(err);
    }
});

cartRouter.param('productId', async (req, res, next) => {
    try {
        const { productId } = req.params;
        req.productId = productId;
        const exists = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
        if(!exists.rows?.length) {
            const error = new Error(`Product with id ${productId} does not exist`);
            error.status = 404;
            throw error;
        };
        req.product = exists;
        next();
    } catch (err) {
        next(err);
    }
});

// create new cart for customer 
cartRouter.post('/new/:customerId', async (req, res, next) => {
    try {
        const date = DateTime.now().toISODate();
        const data = await pool.query('INSERT INTO carts(customer_id, created_date, total_cost) VALUES ($1, $2, null) RETURNING *', [req.params.customerId, date]);
        const cartId = data.rows[0].id;
        res.json(`Cart with id ${cartId} created successfully - PLEASE TAKE NOTE OF THIS ID`);
    } catch (err) {
        next(err);
    };
});


//delete cart (after cart is submitted the temporary cart is no longer needed);
cartRouter.delete('/delete/:customerId/:cartId', async (req, res, next) => {
    try {
        await pool.query('DELETE FROM carts WHERE id = $1', [req.params.cartId]);
        res.json('Cart has been deleted successfully');
    } catch (err) {
        next(err);
    }
});


// get all products from cart (to display)
cartRouter.get('/products/:customerId/:cartId', async (req, res, next) => {
    try {
        const cartProducts = await pool.query('SELECT product_name, price_per_unit, quantity, image FROM carts_products JOIN products ON products.id = carts_products.product_id WHERE cart_id = $1', [req.params.cartId]);
        res.json(cartProducts.rows);
    } catch (err) {
        next(err);
    }
});

//add a new product to cart
cartRouter.post('/products/add/:customerId/:cartId/:productId', async (req, res, next) => {
    try {
        await pool.query('INSERT INTO carts_products(cart_id, product_id, quantity) VALUES ($1, $2, 1)', [req.params.cartId, req.params.productId]);
        // update total_cost in carts table
        updateTotalCost(req.cartId);
        res.json('Added product to cart successfully');
    } catch (err) {
        next(err);
    }
})

//add one to a product quantity
cartRouter.put('/products/increment/:customerId/:cartId/:productId', async (req, res, next) => {
    try {
        await pool.query('UPDATE carts_products SET quantity = quantity + 1 WHERE cart_id = $1 AND product_id = $2 RETURNING *', [req.params.cartId, req.params.productId]);
        updateTotalCost(req.params.cartId);
        res.json('Added one to product quantity');
    } catch (err) {
        next(err);
    }
})

// minus one from a product quantity
cartRouter.put('/products/decrement/:customerId/:cartId/:productId', async (req, res, next) => {
    try {
        const data = await pool.query('SELECT quantity FROM carts_products WHERE cart_id = $1 AND product_id = $2', [req.params.cartId, req.params.productId]);
        if (data.rows[0].quantity === 1) {
            deleteProduct(req.params.cartId, req.params.productId);//deletes product if quantity is 0;
            res.json('Subtracted one from quantity of one, product now removed from cart');
        }
        const product = await pool.query('UPDATE carts_products SET quantity = quantity - 1 WHERE cart_id = $1 AND product_id = $2', [req.params.cartId, req.params.productId]);
        updateTotalCost(req.params.cartId);
        res.json('Subtracted one from product quantity');
    } catch (err) {
        next(err);
    }
})

//delete product in cart
cartRouter.delete('/products/delete/:customerId/:cartId/:productId', async (req, res, next) => {
    try {
        deleteProduct(req.params.cartId, req.params.productId);
        updateTotalCost(req.params.cartId);
        res.json(`Product successfully deleted`);
    } catch (err) {
        next(err);
    }
});


module.exports = cartRouter;