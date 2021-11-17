const { application } = require('express');
const express = require('express');
const pool = require('../db');

const paymentsRouter = express.Router();

paymentsRouter.param('customerId', async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const exists = await pool.query('SELECT * FROM customers WHERE id = $1', [customerId]);
        if(!exists.rows?.length) {
            throw new Error({status: 404, message: `Customer with id ${customerId} does not exist`});
        };
        next();
    } catch (err) {
        next(err);
    }
});

paymentsRouter.param('paymentId', async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const exists = await pool.query('SELECT * FROM carts WHERE id = $1', [paymentId]);
        if(!exists.rows?.length) {
            throw new Error({status: 404, message: `Payment data with id ${paymentId} does not exist`});
        };
        next();
    } catch (err) {
        next(err);
    }
});

//get payment details for customer by customerid
paymentsRouter.get('/data/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const getPaymentId = await pool.query('SELECT payment_id FROM customers WHERE id = $1', [customerId]);
        const paymentId = getPaymentId.rows[0].payment_id;
        const paymentData = await pool.query('SELECT * FROM payment_details WHERE id = $1', [paymentId]);
        res.json(paymentData.rows[0]);
    } catch (err) {
        next(err); 
    }
})

//create new payment details for customer
paymentsRouter.post('/data/new/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const { card_type, card_number, expiry_date, name_on_card, security_code} = req.body;
        const newPaymentData = await pool.query('INSERT INTO payment_details (card_type, card_number, expiry_date, name_on_card, security_code) VALUES ($1, $2, $3, $4, $5) RETURNING *', [card_type, card_number, expiry_date, name_on_card, security_code]);
        const paymentId = newPaymentData.rows[0].id;
        await pool.query('UPDATE customers SET payment_id = $1 WHERE id = $2', [paymentId, customerId]);
        res.json(newPaymentData.rows[0]);
    } catch (err) {
        next(err);
    }
});

//amend payment details for customer
paymentsRouter.put('/data/amend/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const checkId = await pool.query('SELECT * from payment_details WHERE id = $1', [paymentId]);
        for(const property in req.body) {
            await pool.query(`UPDATE payment_details SET ${property} = $1 WHERE id = $2`, [req.body[property], paymentId]);
        }
        const updatedPaymentData = await pool.query('SELECT * from payments_details WHERE id = $1', [paymentId]);
        res.json(updatedPaymentData.rows[0]);

    } catch (err) {
        next(err);
    }
})




module.exports = paymentsRouter;