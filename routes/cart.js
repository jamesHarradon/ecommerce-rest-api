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

// create new cart for customer 
cartRouter.post('/new/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const date = DateTime.now().toISODate();
        const newCart = await pool.query('INSERT INTO carts(customer_id, created_date, total_cost) VALUES ($1, $2, null) RETURNING *', [customerId, date]);
        res.json('Cart created successfully');
    } catch (err) {
        next(err);
    };
});


//delete cart (after cart is submitted the temporary cart is no longer needed);
cartRouter.delete('/delete/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const deleteCart = await pool.query('DELETE FROM carts WHERE id = $1', [cartId]);
        const checkCart = await pool.query('SELECT * FROM carts WHERE id = $1', [cartId]);
        res.json('Cart has been deleted successfully');
    } catch (err) {
        next(err);
    }
});


// get all products from cart (to display)
cartRouter.get('/products/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const cartExists = await pool.query('SELECT * FROM carts WHERE id = $1', [cartId]);
        const cartProducts = await pool.query('SELECT product_name, price_per_unit, quantity, image FROM carts_products JOIN products ON products.id = carts_products.product_id WHERE cart_id = $1', [cartId]);
        res.json(cartProducts.rows);
    } catch (err) {
        next(err);
    }
});

//add a new product to cart
cartRouter.post('/products/add/:cartId/:productId', async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        const newProduct = await pool.query('INSERT INTO carts_products(cart_id, product_id, quantity) VALUES ($1, $2, 1)', [cartId, productId]);
        // update total_cost in carts table
        updateTotalCost(cartId);
        res.json('Added product to cart successfully');
    } catch (err) {
        next(err);
    }
})

//add one to a product quantity
cartRouter.put('/products/increment/:cartId/:productId', async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        const product = await pool.query('UPDATE carts_products SET quantity = quantity + 1 WHERE cart_id = $1 AND product_id = $2 RETURNING *', [cartId, productId]);
        updateTotalCost(cartId);
        res.json('Added one to product quantity');
    } catch (err) {
        next(err);
    }
})

// minus one from a product quantity
cartRouter.put('/products/decrement/:cartId/:productId', async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        const product = await pool.query('UPDATE carts_products SET quantity = quantity - 1 WHERE cart_id = $1 AND product_id = $2 RETURNING *', [cartId, productId]);
        if (product.rows.quantity === 0) {
            deleteProduct(cartId, productId);//deletes product if quantity is 0;
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
cartRouter.delete('/products/delete/:cartId/:productId', async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        deleteProduct(cartId, productId);
        updateTotalCost(cartId);
        res.json(`Product successfully deleted`);
    } catch (err) {
        next(err);
    }
});


module.exports = cartRouter;