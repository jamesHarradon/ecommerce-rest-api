const CustomerModel = require('../models/customer-model');
const { scryptSync, timingSafeEqual} = require('crypto');
const CustomerModelInstance = new CustomerModel;

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
            const user = await CustomerModelInstance.checkExistingUserName(data.user_name);
            if (!user) return null;
            return this.decryptIsMatch(data.password, user.password) ? user : null;
        } catch (err) {
            throw(err);
        }
    }
}

module.exports = AuthService;