const CartModel = require('../models/cart-model');


const CartModelInstance = new CartModel;

class CartService {

    async checkCart(custid) {
        try {
            const cart = await CartModelInstance.checkExistingCart(custid);
            if (!cart) return null;
            return cart;
        } catch (err) {
            throw(err);
        }
    }

    async checkProduct(custid, productid) {
        try {
            const product = await CartModelInstance.checkExistingProductInCart(custid, productid);
            if (!product) return null;
            return true;
        } catch (error) {
            throw(err);
        }
    }

    async createCart(custid) {
        try {
            const newCart = await CartModelInstance.createCart(custid);
            return newCart;
        } catch (err) {
            throw(err);
        }
    }

    async deleteCart(custid) {
        try {
            if(!this.checkCart(custid)) return null;
            await CartModelInstance.deleteCart(custid);
            const data = await CartModelInstance.checkExistingCart(custid);
            return data;

        } catch (err) {
            throw(err);
        }
    }

    async getAllProductsFromCart(custid, cartid) {
        try {
            if(!this.checkCart(custid)) return null;
            const cartProducts = await CartModelInstance.getAllProductsFromCart(cartid);
            return cartProducts;

        } catch (err) {
            throw(err);
        }
    }

    async addNewProductToCart(custid, cartid, productid) {
        try {
            if(!this.checkCart(custid) || !this.checkProduct(custid, productid)) return null;
            const product = await CartModelInstance.addNewProductToCart(custid, cartid, productid);
            if (product) await CartModelInstance.updateTotalCost(cartid);
            return product;

        } catch (err) {
            throw(err);
        }
    }

    async changeQuantity(custid, cartid, productid, plusOrMinus) {
        try {
            let product;
            if(!this.checkCart(custid) || !this.checkProduct(custid, productid)) return null;
            if (plusOrMinus === 'plus') {
                product = await CartModelInstance.incrementProduct(cartid, productid);
            } else if (plusOrMinus === 'minus') {
                product = await CartModelInstance.decrementProduct(cartid, productid);
            } else {
                return;
            }
            if(product) await CartModelInstance.updateTotalCost(cartid);
            return product;
        } catch (err) {
            throw(err);
        }
    }

    async deleteProductFromCart(custid, cartid, productid) {
        try {
            if(!this.checkCart(custid) || !this.checkProduct(custid, productid)) return null;
            await CartModelInstance.deleteProductFromCart(custid, cartid, productid);
            const data = await CartModelInstance.checkExistingProductInCart(custid, productid);
            return data;
        } catch (err) {
            throw(err);   
        }
    }
}

module.exports = CartService;