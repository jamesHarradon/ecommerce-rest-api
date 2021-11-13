const express = require('express');
const pool = require('../db');

const productsRouter = express.Router();


//get all products (to display on page)
productsRouter.get('/', async (req, res) => {
    try {
        const allProducts = await pool.query('SELECT * FROM products');
        res.json(allProducts.rows);

    } catch (err) {
        return res.status(500).send(err);
    }
});

//get product by id
productsRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        res.json(product.rows[0]);
    } catch (err) {
        return res.status(500).send(err);
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
        return res.status(500).send(err);
    }
});

module.exports = productsRouter;


