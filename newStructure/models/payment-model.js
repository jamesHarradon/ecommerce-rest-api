const pool = require("../../db");

class PaymentModel {

    async getPaymentDetails(custid) {
        try {
            const data = await pool.query('SELECT * FROM payment_details WHERE id = (SELECT payment_id FROM customers WHERE id = $1)', [custid]);
            return data.rows?.length ? [data.rows[0]] : null;
        } catch (err) {
            throw new Error(err);
        }
    };

    async createPaymentDetails(data) {
        try {
            const { card_type, card_number, expiry_date, name_on_card} = data;
            const payData = await pool.query('INSERT INTO payment_details (card_type, card_number, expiry_date, name_on_card, security_code) VALUES ($1, $2, $3, $4) RETURNING *', [card_type, card_number, expiry_date, name_on_card]);
            return payData.rows?.length ? payData.rows[0] : null;

        } catch (err) {
            throw new Error(err);
        }
    };

    async setPaymentId(custid, paymentid) {
        try {
            const data = await pool.query('UPDATE customers SET payment_id = $1 WHERE id = $2 RETURNING *', [paymentid, custid]);
            return data.rows?.length ? data.rows[0] : null;

        } catch (err) {
            throw new Error(err);
        }
    };

    async amendPaymentDetails(custid, body) {
        try {
            for(const property in body) {
                await pool.query(`UPDATE payment_details SET ${property} = $1 WHERE id = (SELECT payment_id FROM customers WHERE id = $2)`, [body[property], custid]);
            }
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = PaymentModel;