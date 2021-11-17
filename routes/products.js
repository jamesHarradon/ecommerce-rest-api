const express = require('express');
const pool = require('../db');

const productsRouter = express.Router();

productsRouter.param('id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const exists = await pool.query('SELECT * FROM carts WHERE id = $1', [id]);
        if(!exists.rows?.length) {
            throw new Error(`Product with id ${id} does not exist`);
        };
        req.product = exists;
        next();
    } catch (err) {
        next(err);
    }
});


//get all products (to display on page)
productsRouter.get('/', async (req, res) => {
    try {
        const allProducts = await pool.query('SELECT * FROM products');
        res.json(allProducts.rows);
    } catch (err) {
        next(err);
    }
});

//get product by id
productsRouter.get('/:id', async (req, res) => {
    try {
        res.json(req.product.rows[0]);
    } catch (err) {
        next(err);
    }
})

//get products by search term
productsRouter.get('/search/:searchTerm', async (req, res) => {
    try {
        let { searchTerm } = req.params;
        let term = '%' + searchTerm + '%';
        // ILIKE is same as LIKE but with case insensitivity
        const searchedProducts = await pool.query('SELECT * FROM products WHERE product_name ILIKE $1', [term]);
        if (searchedProducts.rows?.length) {
            res.json(searchedProducts.rows);
            return;
        };
        res.json([]);
    } catch (err) {
        next(err);
    }
});

module.exports = productsRouter;


