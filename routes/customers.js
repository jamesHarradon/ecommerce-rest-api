const express = require('express');
const pool = require('../db');
const { DateTime } = require('luxon');
const { encrypt, decryptIsMatch } = require('../modules/password');

const customersRouter = express.Router();


//NOTE the question mark in checkExisting.rows?.length is known as optional chaining, and it will return undefined for an non-existant property from an API instead of an error messsage like 'cannot read property 'something' of undefined.'

customersRouter.param('customerId', async (req, res, next) => {
    try {
        const { customerId } = req.params;
        req.customerId = customerId;
        const exists = await pool.query('SELECT * FROM customers WHERE id = $1', [customerId]);
        if(!exists.rows?.length) {
            const error = new Error(`Customer with id ${customerId} does not exist`);
            error.status = 404;
            throw error;
        };
        req.customer = exists;
        next();
    } catch (err) {
        next(err);
    }
});

customersRouter.param('contactId', async (req, res, next) => {
    try {
        const { contactId } = req.params;
        req.contactId = contactId;
        const exists = await pool.query('SELECT * FROM contacts WHERE id = $1', [contactId]);
        if(!exists.rows?.length) {
            const error = new Error(`Contact data with id ${contactId} does not exist`);
            error.status = 404;
            throw error;
        };
        req.contact = exists;
        next();
    } catch (err) {
        next(err);
    }
});


//create a new login
customersRouter.post('/register', async (req, res, next) => {
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

//create new contact details for customer
customersRouter.post('/contact/data/new/:customerId', async (req, res, next) => {
    try {
        const { address_line1, address_line2, town, city, county, post_code, phone, email} = req.body;
        const newContact = await pool.query('INSERT INTO contacts (address_line1, address_line2, town, city, county, post_code, phone, email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [address_line1, address_line2, town, city, county, post_code, phone, email]);
        const contactId = newContact.rows[0].id;
        await pool.query('UPDATE customers SET contact_id = $1 WHERE id = $2', [contactId, req.customerId]);
        res.json(newContact.rows[0]);
    } catch (err) {
        next(err);
    }
});

//amend contact details for customer
customersRouter.put('/contact/data/amend/:contactId', async (req, res, next) => {
    try {
        for(const property in req.body) {
            await pool.query(`UPDATE contacts SET ${property} = $1 WHERE id = $2`, [req.body[property], req.contactId]);
        }
        const updatedContact = await pool.query('SELECT * from contacts WHERE id = $1', [req.contactId]);
        res.json(updatedContact.rows[0]);
    } catch (err) {
        next(err);
    }
})

//get an existing customer login by username and password
customersRouter.get('/login/:username/:password', async (req, res, next) => {
    try {
        const { username, password } = req.params;
        const user = await pool.query('SELECT * FROM customers WHERE user_name = $1', [username]);
        if (!user.rows?.length) {
            const error = new Error('Login data incorrect, please try again');
            error.status = 401;
            throw error;
        }
        const userPassword = user.rows[0].password;
        if (decryptIsMatch(password, userPassword)) {
            res.json('You have successfully logged in')
        } else {
            const error = new Error('Login data incorrect, please try again');
            error.status = 401;
            throw error;
        }
    } catch (err) {
        next(err);
    }
});


//get all personal data for customer
customersRouter.get('/data/:customerId', async (req, res, next) => {
    try {
        const customerData = await pool.query('SELECT customers.id as customer_id, contacts.id as contact_id, payment_id, first_name, last_name, user_name, address_line1, address_line2, town, city, county, post_code, phone, email FROM customers JOIN contacts ON customers.contact_id = contacts.id WHERE customers.id = $1', [req.customerId]);
        res.json(customerData.rows[0]);
    } catch (err) {
        next(err);
    }
})

module.exports = customersRouter;