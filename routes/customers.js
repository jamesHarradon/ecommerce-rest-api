const express = require('express');
const pool = require('../db');
const { DateTime } = require('luxon');

const customersRouter = express.Router();




//NOTE the question mark in checkExisting.rows?.length is known as optional chaining, and it will return undefined for an non-existant property from an API instead of an error messsage like 'cannot read property 'something' of undefined.'

//create a new login
customersRouter.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, user_name, password } = req.body;
        const date = DateTime.now().toISODate();
        const checkExisting = await pool.query('SELECT user_name FROM customers WHERE user_name = $1', [user_name]);
        if (checkExisting.rows?.length) {
            res.json(`User name ${user_name} has already been taken`);
            return;
        }
        const newLogin = await pool.query('INSERT INTO customers (user_name, password, date_created, contact_id, first_name, last_name) VALUES ($1, $2, $3, null, $4, $5) RETURNING user_name, date_created, contact_id, first_name, last_name ', [user_name, password, date, first_name, last_name]);
        res.json(newLogin.rows[0]);
        
    } catch (err) {
        return res.status(500).send(err);
    }
});

//create new contact details for customer
customersRouter.post('/contact', async (req, res) => {
    try {
        const { address_line1, address_line2, town, city, county, post_code, phone, email} = req.body;
        const newContact = await pool.query('INSERT INTO contacts (address_line1, address_line2, town, city, county, post_code, phone, email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [address_line1, address_line2, town, city, county, post_code, phone, email]);
        res.json(newContact.rows[0]);
    } catch (err) {
        return res.status(500).send(err);
    }
});

//amend contact details for customer
customersRouter.put('/contact/:contactId', async (req, res) => {
    try {
        const { contactId } = req.params;
        const checkId = await pool.query('SELECT * from contacts WHERE id = $1', [contactId]);
        if (!checkId.rows?.length) {
            res.status(404).json(`Contact ID ${contactId} does not exist`);
            return;
        }
        for(const property in req.body) {
            await pool.query(`UPDATE contacts SET ${property} = $1 WHERE id = $2`, [req.body[property], contactId]);
        }
        const updatedContact = await pool.query('SELECT * from contacts WHERE id = $1', [contactId]);
        res.json(updatedContact.rows[0]);

    } catch (err) {
        return res.status(500).send(err);
    }
})



//get an existing customer login by username and password
customersRouter.get('/login/:username/:password', async (req, res) => {
    try {
        const { username, password } = req.params;
        const existingCustomer = await pool.query('SELECT * FROM customers WHERE user_name = $1 AND password = $2', [username, password]);
        if (!existingCustomer.rows?.length) {
            res.status(401).json('Login details are incorrect');
            return;
        }
        res.json('You have successfully logged in')
        
    } catch (err) {
        console.error(err.message)
    }
});

//get all personal data for customer
customersRouter.get('/data/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const customerData = await pool.query('SELECT customers.id as customer_id, contacts.id as contact_id, first_name, last_name, user_name, address_line1, address_line2, town, city, county, post_code, phone, email FROM customers JOIN contacts ON customers.contact_id = contacts.id WHERE customers.id = $1', [customerId]);
        if (!customerData.rows?.length) {
            res.status(404).json(`Customer with ID ${customerId} does not exist`);
            return;
        };
        res.json(customerData.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
})

module.exports = customersRouter;