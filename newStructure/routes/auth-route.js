const express = require('express');
const jwt = require('jsonwebtoken');
const isAuthorized = require('../../modules/isAuthorized');
const AuthService = require('../services/auth-service');

const AuthServiceInstance = new AuthService;

const authRouter = express.Router();

//customer login
authRouter.post('/login', isAuthorized, async (req, res, next) => {
    try {
        const response = await AuthServiceInstance.login(req.body);
        if(response) {
            let secret = process.env.TOKEN_SECRET;
            let token = jwt.sign({id: response.id}, secret, { algorithm: 'HS256', expiresIn: "1800s"});
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: 1000 * 60 * 30,
                //secure: true - use for https only
            }).json('You have successfully logged in');
        } else {
            const error = new Error('Your login attempt failed, please try again');
            error.status = 403;
            throw error;
        }
    } catch (err) {
        next(err);
    }
});

authRouter.get('/logout', (req, res, next) => {
    res.clearCookie('jwt').send('You have successfully logged out.')
})

module.exports = authRouter;