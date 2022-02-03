const { DateTime } = require("luxon");
const pool = require("../../db");

class CartModel {

    getDate() {
        return DateTime.now().toISO();
    }

    async updateTotalCost(cartid) {
        try {
            await pool.query('UPDATE carts SET total_cost = (SELECT SUM(price_per_unit * quantity) FROM products JOIN carts_products ON products.id = carts_products.product_id WHERE cart_id = $1) WHERE id = $1 RETURNING total_cost', [cartid]);
        } catch (err) {
            throw new Error(err);
        }
    };

    async checkExistingCart(custid) {
        try {
            const cart = await pool.query('SELECT * FROM carts WHERE id = (SELECT id FROM carts WHERE customer_id = $1)', [custid]);
            return cart.rows?.length ? cart.rows[0] : null;
        } catch (err) {
            throw new Error(err);
        }
    }

    async createCart(custid) {
        try {
            const date = this.getDate();
            const data = await pool.query('INSERT INTO carts(customer_id, created_date, total_cost) VALUES ($1, $2, null) RETURNING *', [custid, date]);
            return data.rows?.length ? data.rows[0] : null;
        } catch (err) {
            throw new Error(err);
        }
    }

    async deleteCart(custid) {
        try {
            await pool.query('DELETE FROM carts_products WHERE cart_id = (SELECT id FROM carts WHERE customer_id = $1)', [custid]);
            await pool.query('DELETE FROM carts WHERE id = (SELECT id FROM carts WHERE customer_id = $1)', [custid]);
        
        } catch (err) {
            throw new Error(err);
        }
    }

    async getAllProductsFromCart(cartid) {
        try {
            const data = await pool.query('SELECT product_id, product_name, price_per_unit, quantity, image FROM carts_products JOIN products ON products.id = carts_products.product_id WHERE cart_id = $1 ORDER BY 1', [cartid]);
            return data.rows?.length ? data.rows : [];
        } catch (err) {
            throw new Error(err);
        }
    }

    async checkExistingProductInCart(custid, productid) {
        try {
            const product = await pool.query('SELECT * FROM carts JOIN carts_products cp ON carts.id = cp.cart_id WHERE carts.id = (SELECT id FROM carts WHERE customer_id = $1) AND product_id = $2', [custid, productid]);
            return product.rows?.length ? product.rows[0] : null;
        } catch (err) {
            throw new Error(err);
        }
    }

    async addNewProductToCart(custid, cartid, productid, quantity) {
        try {
            const data = await pool.query('INSERT INTO carts_products(cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *', [cartid, productid, quantity]);
            return data.rows?.length ? data.rows[0] : null;
        } catch (err) {
            throw new Error(err);
        }
    }
    
    async incrementProduct(cartid, productid) {
        try {
            const data = await pool.query('with updated as (UPDATE carts_products SET quantity = quantity + 1 WHERE cart_id = $1 AND product_id = $2 RETURNING *) SELECT * FROM updated ORDER BY product_id', [cartid, productid]);
            return data.rows?.length ? data.rows[0] : null;
            
        } catch (err) {
            throw new Error(err);
        }
    }

    async decrementProduct(cartid, productid) {
        try {
            const data = await pool.query('with updated as (UPDATE carts_products SET quantity = quantity - 1 WHERE cart_id = $1 AND product_id = $2 RETURNING *) SELECT * FROM updated ORDER BY product_id', [cartid, productid]);
            return data.rows?.length ? data.rows[0] : null;
            
        } catch (err) {
            throw new Error(err);
        }
    }

    async deleteProductFromCart(custid, cartid, productid) {
        try {
            await pool.query('DELETE FROM carts_products WHERE cart_id = $1 AND product_id = $2', [cartid, productid]);
            
        } catch (err) {
            throw new Error(err);
        }
    }

    // for replacing a guest basket to a logged in basket if user had an existing basket in db
    async deleteAllProductsFromCart(cartid) {
        try {
            await pool.query('DELETE FROM carts_products WHERE cart_id = $1', [cartid])
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = CartModel;