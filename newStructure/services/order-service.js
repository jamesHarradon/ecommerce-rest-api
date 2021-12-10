
const OrderModel = require('../models/order-model');

const OrderModelInstance = new OrderModel;

class OrderService {

    async createOrder(custid, cartid) {
        try {
            const newOrder = await OrderModelInstance.addToOrders(custid, cartid);
            if(!newOrder) return null;
            await OrderModelInstance.addToOrdersProducts(custid, cartid);
            const orderCheck = OrderModelInstance.getSingleOrder(custid, newOrder.id)
            if(!orderCheck) return null;
            return newOrder;
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