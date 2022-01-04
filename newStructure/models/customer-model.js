const { DateTime } = require('luxon');
const pool = require("../../db");

class CustomerModel {
    getDate() {
        return DateTime.now().toISO();
    }
    
    async createLogin(data) {
        try {
            const { first_name, last_name, email, password } = data;
            const date = this.getDate();
            const newLogin = await pool.query('INSERT INTO customers (email, password, date_created, contact_id, first_name, last_name) VALUES ($1, $2, $3, null, $4, $5) RETURNING email, date_created, contact_id, first_name, last_name ', [email, password, date, first_name, last_name]);
            return newLogin.rows[0];
        } catch (err) {
            throw new Error(err);
        }
    }

    async checkExistingEmail(email) {
        try {
            const data = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
            return data.rows?.length ? data.rows[0] : null;
        } catch (err) {
            throw new Error(err);
        }
    }

    async checkExistingContact(custid) {
        try {
            const data = await pool.query('SELECT * FROM contacts WHERE id = (SELECT contact_id FROM customers WHERE id = $1)', [custid]);
            return data.rows?.length ? data.rows[0] : null;
        } catch (err) {
            throw new Error(err);
        }
    }

    async createContact(data) {
        try {
            const { address_line1, address_line2, town, city, county, post_code, phone, email} = data;
            const newContact = await pool.query('INSERT INTO contacts (address_line1, address_line2, town, city, county, post_code, phone, email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [address_line1, address_line2, town, city, county, post_code, phone, email]);
            return newContact.rows?.length ? newContact.rows[0] : null;
        } catch (err) {
            throw new Error(err);
        }
    }

    async addContactIdForCustomer(custid, contactid) {
        try {
            await pool.query('UPDATE customers SET contact_id = $1 WHERE id = $2', [custid, contactid]);
        } catch (err) {
            throw new Error(err);
        }
    }

    async amendContact(custid, data) {
        try {
            for(const property in data) {
                await pool.query(`UPDATE contacts SET ${property} = $1 WHERE id = (SELECT contact_id FROM customers WHERE id = $2)`, [data[property], custid]);
            }
        } catch (err) {
            throw new Error(err);
        }
    }

    async getCustomerData(custid) {
        try {
            const data = await pool.query('SELECT customers.id as customer_id, contacts.id as contact_id, payment_id, first_name, last_name, address_line1, address_line2, town, city, county, post_code, phone, email FROM customers JOIN contacts ON customers.contact_id = contacts.id WHERE customers.id = $1', [custid]);
            return data.rows?.length ? data.rows[0] : null;
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = CustomerModel;