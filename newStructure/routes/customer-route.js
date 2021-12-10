const express = require('express');
const pool = require('../../db');
const isAuthorized = require('../../modules/isAuthorized');
const CustomerService = require('../services/customer-service');

const CustomerServiceInstance = new CustomerService;

const customerRouter = express.Router();

//register new customer
customerRouter.post('/register', async (req, res, next) => {
    try {
        const response = await CustomerServiceInstance.register(req.body);
        res.json(response);
    } catch (err) {
        next(err);
    }
})

// create new contact details for customer
customerRouter.post('/contact/data/new/:customerId', isAuthorized, async (req, res, next) => {
    try {
        const response = await CustomerServiceInstance.createContact(req.params.customerId, req.body);
        res.json(response)
    } catch (err) {
        next(err);
    }
});

// amend contact details for customer
customerRouter.put('/contact/data/amend/:customerId', isAuthorized, async (req, res, next) => {
    try {
        const response = await CustomerServiceInstance.amendContact(req.params.customerId, req.body);
        res.json(response);
    } catch (err) {
        next(err);
    }
});

//get all personal data for customer
customerRouter.get('/data/:customerId', isAuthorized, async (req, res, next) => {
    try {
        const response = await CustomerServiceInstance.getCustomerData(req.params.customerId);
        res.json(response);
    } catch (err) {
        next(err);   
    }
})

module.exports = customerRouter;