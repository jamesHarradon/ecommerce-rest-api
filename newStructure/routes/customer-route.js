const express = require('express');
const jwt = require('jsonwebtoken');
const isAuthorized = require('../../modules/isAuthorized');
const CustomerService = require('../services/customer-service');

const CustomerServiceInstance = new CustomerService;

const customerRouter = express.Router();

const isProduction = process.env.NODE_ENV === 'production';

//register new customer
customerRouter.post('/register', async (req, res, next) => {
    try {
        const response = await CustomerServiceInstance.register(req.body);
        
        if(response) {
            
            let secret = process.env.TOKEN_SECRET;
            let token = jwt.sign({id: response.id}, secret, { algorithm: 'HS256', expiresIn: "3600s"});
            res.cookie('jwt_ukulele', token, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60,
                sameSite: isProduction ? 'none' : 'lax',
                secure: isProduction ? true : false,
            })
            res.json(response.id);
        } else {
            //response above is null when the users email they are trying to register is already in the database.
            res.status(400).send();
        }
   
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

//get customer email 
customerRouter.get('/data/email/:customerId', isAuthorized, async (req, res, next) => {
    try {
        const response = await CustomerServiceInstance.getCustomerEmail(req.params.customerId);
        res.json(response);
    } catch (err) {
        next(err);   
    }
})

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