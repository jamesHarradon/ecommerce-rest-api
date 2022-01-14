
const OrderModel = require('../models/order-model');
const CartService = require('./cart-service');

const OrderModelInstance = new OrderModel;
const CartServiceInstance = new CartService;

class OrderService {

    async createOrder(custid, cartid) {
        try {
            const newOrder = await OrderModelInstance.addToOrders(custid, cartid);
            if(!newOrder) return null;
            await OrderModelInstance.addToOrdersProducts(custid, cartid, newOrder.id);
            const orderCheck = await OrderModelInstance.getSingleOrder(custid, newOrder.id);
            if(!orderCheck) return null;
            const deleteCart = await CartServiceInstance.deleteCart(custid);
            deleteCart ? newOrder : null;
        } catch (err) {
            throw(err);
        }
    }

    async getMostRecentOrder(custid) {
        try {
            const order = await OrderModelInstance.getMostRecentOrder(custid);
            return order;
        } catch (err) {
            throw(err);
        }
    }

    async getAllOrders(custid) {
        try {
            const allOrders = await OrderModelInstance.getAllOrders(custid);
            return allOrders;
        } catch (err) {
            throw(err);
        }
    }

    async getSingleOrder(custid, orderid) {
        try {
            const exists = await OrderModelInstance.checkExistingOrder(custid, orderid);
            if(!exists) return null;
            const order = await OrderModelInstance.getSingleOrder(custid, orderid);
            return order;
        } catch (err) {
            throw(err);
        }
    }
}

module.exports = OrderService;