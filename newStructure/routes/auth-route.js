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
            }).sendStatus(200);
        } else {
            res.status(403).send();
        }
    } catch (err) {
        next(err);
    }
});

authRouter.post('/logout', (req, res, next) => {
    res.clearCookie('jwt').sendStatus(200);
})

module.exports = authRouter;