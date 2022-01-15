const { scryptSync, randomBytes } = require('crypto');
const CustomerModel = require('../models/customer-model');

const CustomerModelInstance = new CustomerModel;

class CustomerService {
    
    async encrypt(password) {
        const salt = randomBytes(16).toString('hex');
        const hashedPassword = scryptSync(password, salt, 64).toString('hex');
        const passwordEncrypted = `${salt}:${hashedPassword}`;
        return passwordEncrypted;
        //need to await this as returns promise
    }

    async register(data) {
        try {
            const user = await CustomerModelInstance.checkExistingEmail(data.email);
            if (!user) {
                const encryptedPassword = this.encrypt(data.password);
                const newData = {...data, password: await encryptedPassword}
                const loginData = await CustomerModelInstance.createLogin(newData);
                return loginData;
            } else {
                return null;
            }
            
        } catch (err) {
            throw(err);
        }
    }

    async googleRegister(data) {
        try {
            const user = await CustomerModelInstance.checkExistingGoogleId(data.google_id);
            if(user) {
                return user;
            } else {
                const newUser = await CustomerModelInstance.createLogin(data);
                return newUser;
            }
        } catch (err) {
            throw(err)
        }
    }

    async createContact(custid, data) {
        try {
            const contactData = await CustomerModelInstance.createContact(data);
            await CustomerModelInstance.addContactIdForCustomer(custid, contactData[0].id);
            return contactData;
            
        } catch (err) {
            throw(err);
        }
    }

    async amendContact(custid, data) {
        try {
            const contactData = await CustomerModelInstance.checkExistingContact(custid);
            if (!contactData) return null;
            await CustomerModelInstance.amendContact(custid, data);
            const custData = await CustomerModelInstance.getCustomerData(custid);
            return custData;
            
        } catch (err) {
            throw(err);
        }
    }


    async getCustomerData(custid) {
        try {
            const data = CustomerModelInstance.getCustomerData(custid);
            return data;
        } catch (err) {
            throw(err);
        }
    }
}

module.exports = CustomerService;