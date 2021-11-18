const express = require('express');
const pool = require('../db');
const { DateTime } = require('luxon');


const cartRouter = express.Router();

const updateTotalCost = async (cartId) => {
    return await pool.query('UPDATE carts SET total_cost = (SELECT SUM(price_per_unit * quantity) FROM products JOIN carts_products ON products.id = carts_products.product_id WHERE cart_id = $1) WHERE id = $1 RETURNING total_cost', [cartId]);
};

const deleteProduct = async (cartId, productId) => {
    return await pool.query('DELETE FROM carts_products WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
}

cartRouter.param('customerId', async (req, res, next) => {
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

cartRouter.param('cartId', async (req, res, next) => {
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
        await pool.query('INSERT INTO carts(customer_id, created_date, total_cost) VALUES ($1, $2, null) RETURNING *', [req.customerId, date]);
        res.json('Cart created successfully');
    } catch (err) {
        next(err);
    };
});


//delete cart (after cart is submitted the temporary cart is no longer needed);
cartRouter.delete('/delete/:cartId', async (req, res, next) => {
    try {
        await pool.query('DELETE FROM carts WHERE id = $1', [req.cartId]);
        res.json('Cart has been deleted successfully');
    } catch (err) {
        next(err);
    }
});


// get all products from cart (to display)
cartRouter.get('/products/:cartId', async (req, res, next) => {
    try {
        const cartProducts = await pool.query('SELECT product_name, price_per_unit, quantity, image FROM carts_products JOIN products ON products.id = carts_products.product_id WHERE cart_id = $1', [req.cartId]);
        res.json(cartProducts.rows);
    } catch (err) {
        next(err);
    }
});

//add a new product to cart
cartRouter.post('/products/add/:cartId/:productId', async (req, res, next) => {
    try {
        await pool.query('INSERT INTO carts_products(cart_id, product_id, quantity) VALUES ($1, $2, 1)', [req.cartId, req.productId]);
        // update total_cost in carts table
        updateTotalCost(req.cartId);
        res.json('Added product to cart successfully');
    } catch (err) {
        next(err);
    }
})

//add one to a product quantity
cartRouter.put('/products/increment/:cartId/:productId', async (req, res, next) => {
    try {
        await pool.query('UPDATE carts_products SET quantity = quantity + 1 WHERE cart_id = $1 AND product_id = $2 RETURNING *', [req.cartId, req.productId]);
        updateTotalCost(req.cartId);
        res.json('Added one to product quantity');
    } catch (err) {
        next(err);
    }
})

// minus one from a product quantity
cartRouter.put('/products/decrement/:cartId/:productId', async (req, res, next) => {
    try {
        const product = await pool.query('UPDATE carts_products SET quantity = quantity - 1 WHERE cart_id = $1 AND product_id = $2 RETURNING *', [req.cartId, req.productId]);
        if (product.rows.quantity === 0) {
            deleteProduct(req.cartId, req.productId);//deletes product if quantity is 0;
            return;
        }
        updateTotalCost(cartId);
        res.json('Subtracted one from product quantity');
        res.json(product);
    } catch (err) {
        next(err);
    }
})

//delete product in cart
cartRouter.delete('/products/delete/:cartId/:productId', async (req, res, next) => {
    try {
        deleteProduct(req.cartId, req.productId);
        updateTotalCost(req.cartId);
        res.json(`Product successfully deleted`);
    } catch (err) {
        next(err);
    }
});


module.exports = cartRouter;