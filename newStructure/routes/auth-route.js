const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const isAuthorized = require('../../modules/isAuthorized');
const CustomerModel = require('../models/customer-model');
const AuthService = require('../services/auth-service');


const AuthServiceInstance = new AuthService;
const CustomerModelInstance = new CustomerModel;

const authRouter = express.Router();

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter.get('/google/redirect', passport.authenticate('google', {failureMessage: true }), async (req, res, next) => {
    try {
        res.redirect('http://localhost:3000/products');
    } catch (err) {
        next(err);
    }
});

// for app to check for active session cookie on render
authRouter.get('/active/:customerId', isAuthorized, async (req, res, next) => {
    if (req.isAuthorized) {
        res.json(req.userid);
    } else {
        next(err);
    }
});


//customer login
authRouter.post('/login', isAuthorized, async (req, res, next) => {
    try {
        if(req.isAuthorized) {
            res.redirect('http://localhost:3000/');
        }
        const response = await AuthServiceInstance.login(req.body);
        if(response) {
            let secret = process.env.TOKEN_SECRET;
            let token = jwt.sign({id: response.id}, secret, { algorithm: 'HS256', expiresIn: "1800s"});
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: 1000 * 60 * 30,
                //sameSite: look into this
                //secure: true - use for https only
            }).sendStatus(200);
        } else {
            res.status(403).send();
        }
    } catch (err) {
        next(err);
    }
});

//customer logout
authRouter.post('/logout', (req, res, next) => {
    res.clearCookie('jwt').sendStatus(200);
})

module.exports = authRouter;