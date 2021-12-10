const pool = require("../../db");

class ProductModel {

    async getProductById(productid) {
        try {
            const data = await pool.query('SELECT * FROM products WHERE id = $1', [productid]);
            return data.rows?.length ? data.rows[0] : null;

        } catch (err) {
            throw new Error(err);
        }
    };

    async getAllProducts() {
        try {
            const data = await pool.query('SELECT * FROM products');
            return data.rows?.length ? data.rows : null;

        } catch (err) {
            throw new Error(err);
        }
    };

    async getProductsBySearchTerm(term) {
        try {
            let searchTerm = '%' + term + '%';
            // ILIKE is same as LIKE but with case insensitivity
            const data = await pool.query('SELECT * FROM products WHERE product_name ILIKE $1', [searchTerm]);
            return data.rows?.length ? data.rows : null;
            
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = ProductModel;