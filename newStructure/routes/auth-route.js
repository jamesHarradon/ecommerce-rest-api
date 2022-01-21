const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const isAuthorized = require('../../modules/isAuthorized');
const CustomerService = require('../services/customer-service');
const AuthService = require('../services/auth-service');


const AuthServiceInstance = new AuthService;
const CustomerServiceInstance = new CustomerService;

const authRouter = express.Router();

const isProduction = process.env.NODE_ENV === 'production';

authRouter.post('/google/login/success', async (req, res, next) => {
    try {
        const { first_name, last_name, email, google_id } = req.body;
        let bodyData = {first_name: first_name, last_name: last_name, email: email, password: null, google_id: google_id};
        // finds cust id in db from google id or creates new account and gets cust id to put in cookie
        const userData = await CustomerServiceInstance.googleLoginRegister(bodyData); 
    
        let secret = process.env.TOKEN_SECRET;
        let token = jwt.sign({id: userData.id }, secret, { algorithm: 'HS256', expiresIn: "1800s"});
        res.cookie('jwt_ukulele', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction ? true : false,
    }).json(userData.id);
    } catch (err) {
        console.log(err);
    }
});



//customer login
authRouter.post('/login', async (req, res, next) => {
    try {
        const response = await AuthServiceInstance.login(req.body);
        if(response) {
            let secret = process.env.TOKEN_SECRET;
            let token = jwt.sign({id: response.id}, secret, { algorithm: 'HS256', expiresIn: "1800s"});
            res.cookie('jwt_ukulele', token, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60,
                sameSite: isProduction ? 'none' : 'lax',
                secure: isProduction ? true : false,
            })
            res.json(response.id);
        } else {
            res.status(401).send();
        }
    } catch (err) {
        next(err);
    }
});

authRouter.put('/change-password/:customerId', isAuthorized, async (req, res, next) => {
    try {
        const response = await AuthServiceInstance.changePassword(req.params.customerId, req.body);
        if(response) {
            res.sendStatus(200);
        } else {
            res.status(401).json('Current Password Incorrect!');
        }
    } catch (err) {
        next(err);
    }
})

//customer logout
authRouter.post('/logout', (req, res, next) => {
    res.clearCookie('jwt_ukulele').sendStatus(200);
})

module.exports = authRouter;