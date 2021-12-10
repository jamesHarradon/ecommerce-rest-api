const express = require('express');
const pool = require('../db');
const { DateTime } = require('luxon');
const isAuthorized = require('../modules/isAuthorized');
const { encrypt, decryptIsMatch } = require('../modules/password');
const jwt = require('jsonwebtoken');

const authRouter = express.Router();


//create a new login
authRouter.post('/register', async (req, res, next) => {
    try {
        const { first_name, last_name, user_name, password } = req.body;
        const passwordEnc = encrypt(password);
        const date = DateTime.now().toISODate();
        const checkExisting = await pool.query('SELECT user_name FROM customers WHERE user_name = $1', [user_name]);
        if (checkExisting.rows?.length) {
            throw new Error(`Username ${user_name} already in use, please choose another`);
        }
        const newLogin = await pool.query('INSERT INTO customers (user_name, password, date_created, contact_id, first_name, last_name) VALUES ($1, $2, $3, null, $4, $5) RETURNING user_name, date_created, contact_id, first_name, last_name ', [user_name, passwordEnc, date, first_name, last_name]);
        res.json(newLogin.rows[0]);
    } catch (err) {
        next(err);
    }
});

//get an existing customer login by username and password
authRouter.post('/login', isAuthorized, async (req, res, next) => {
    try {
        const { user_name, password } = req.body;
        const user = await pool.query('SELECT * FROM customers WHERE user_name = $1', [user_name]);
        if (!user.rows?.length) {
            const error = new Error('Login data incorrect, please try again');
            error.status = 401;
            throw error;
        }
        const userPassword = user.rows[0].password;
        if (decryptIsMatch(password, userPassword)) {
            let secret = process.env.TOKEN_SECRET;
            let token = jwt.sign({id: user.rows[0].id}, secret, { algorithm: 'HS256', expiresIn: "1800s"});
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: 1000 * 60 * 30,
                //secure: true - use for https only
            }).json('You have successfully logged in');
        } else {
            const error = new Error('Login data incorrect, please try again');
            error.status = 401;
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