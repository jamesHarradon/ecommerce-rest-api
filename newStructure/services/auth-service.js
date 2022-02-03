const CustomerModel = require('../models/customer-model');
const { scryptSync, timingSafeEqual} = require('crypto');
const CustomerService = require('./customer-service');

const CustomerModelInstance = new CustomerModel;
const CustomerServiceInstance = new CustomerService;

class AuthService {

    async decryptIsMatch(enteredPassword, userPassword) {
        const [salt, key] = userPassword.split(':');
        const hashedBuffer = scryptSync(enteredPassword, salt, 64);
        const keyBuffer = Buffer.from(key, 'hex');
        const match = timingSafeEqual(hashedBuffer, keyBuffer);
        
        if (match) {
            return true;
        } else {
            return false;
        }
    }

    async login(data) {
        try {
            const user = await CustomerModelInstance.checkExistingEmail(data.email);
            let password = user ? user.password : null
            if (!user || !password) return null;
            const result = await this.decryptIsMatch(data.password, user.password)
            return result ? user : null;
        } catch (err) {
            throw(err);
        }
    }

    async changePassword(custid, data) {
        try {
            const user = await CustomerModelInstance.checkExistingId(custid);
            const match = this.decryptIsMatch(data.current_password, user.password);
            if(match) {
                const encryptedPassword = await CustomerServiceInstance.encrypt(data.new_password);
                const newData = { password: encryptedPassword }
                await CustomerModelInstance.amendLoginData(custid, newData);
                return true;
            } else {
                return null;
            }
        } catch (err) {
            throw(err);
        }
    }
}

module.exports = AuthService;