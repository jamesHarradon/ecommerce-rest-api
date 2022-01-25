const { DateTime } = require('luxon');
const pool = require("../../db");

class CustomerModel {
    getDate() {
        return DateTime.now().toISO();
    }
    
    async createLogin(data) {
        try {
            const { first_name, last_name, email, password, google_id } = data;
            const date = this.getDate();
            const newLogin = await pool.query('INSERT INTO customers (password, date_created, contact_id, first_name, last_name, payment_id, email, google_id) VALUES ($1, $2, null, $3, $4, null, $5, $6) RETURNING id, first_name, last_name, email, google_id', [password, date, first_name, last_name, email, google_id]);
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


    async checkExistingId(id) {
        try {
            const data = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
            return data.rows?.length ? data.rows[0] : null;
        } catch (err) {
            throw new Error(err);
        }
    }

    async checkExistingGoogleId(id) {
        try {
            const data = await pool.query('SELECT * FROM customers WHERE google_id = $1', [id]);
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
            const { address_line1, address_line2, town_city, county, post_code, phone, email} = data;
            const newContact = await pool.query('INSERT INTO contacts (address_line1, address_line2, town_city, county, post_code, phone, email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [address_line1, address_line2, town_city, county, post_code, phone, email]);
            return newContact.rows?.length ? [newContact.rows[0]] : null;
        } catch (err) {
            throw new Error(err);
        }
    }

    async addContactIdForCustomer(custid, contactid) {
        try {
            await pool.query('UPDATE customers SET contact_id = $2 WHERE id = $1', [custid, contactid]);
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

    async amendLoginData(custid, data) {
        try {
            for(const property in data) {
                await pool.query(`UPDATE customers SET ${property} = $1 WHERE id = $2`, [data[property], custid]);
            }
        } catch (err) {
            throw new Error(err);
        }
    }

    async getCustomerEmail(custid) {
        try {
            const email = await pool.query('SELECT email FROM customers WHERE id = $1', [custid]);
            return email.rows?.length ? email.rows[0] : null;
        } catch (err) {
            throw new Error(err);
        }
    }

    async getCustomerData(custid) {
        try {
            const data = await pool.query('SELECT customers.id as customer_id, contacts.id as contact_id, payment_id, first_name, last_name, address_line1, address_line2, town_city, county, post_code, phone, customers.email FROM customers JOIN contacts ON customers.contact_id = contacts.id WHERE customers.id = $1', [custid]);
            return data.rows?.length ? [data.rows[0]] : null;
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = CustomerModel;