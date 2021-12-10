const express = require('express');
const isAuthorized = require('../../modules/isAuthorized');

const PaymentService = require('../services/payment-service');

const PaymentServiceInstance = new PaymentService;

const paymentRouter = express.Router();

//get payment data by customer id 
paymentRouter.get('/data/:customerId', isAuthorized, async (req, res, next) => {
    try {
        const response = await PaymentServiceInstance.getPaymentDetails(req.params.customerId);
        res.json(response);
    } catch (err) {
        next(err);
    }
})

//create payment data
paymentRouter.post('/data/new/:customerId', isAuthorized, async (req, res, next) => {
    try {
        const response = await PaymentServiceInstance.createPaymentDetails(req.params.customerId, req.body);
        res.json(response);
    } catch (err) {
        next(err);
    }
})

//amend payment data
paymentRouter.put('/data/amend/:customerId', isAuthorized, async (req, res, next) => {
    try {
        const response = await PaymentServiceInstance.amendPaymentDetails(req.params.customerId, req.body);
        res.json(response);
    } catch (err) {
        next(err);
    }
})

module.exports = paymentRouter;