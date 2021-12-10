const PaymentModel = require('../models/payment-model');

const PaymentModelInstance = new PaymentModel;

class PaymentService {
     
    async getPaymentDetails(custid) {
        try {
            const data = await PaymentModelInstance.getPaymentDetails(custid);
            return data;
        } catch (err) {
            throw(err);
        }
    };

    async createPaymentDetails(custid, data) {
        try {
            const payData = await PaymentModelInstance.createPaymentDetails(data);
            await PaymentModelInstance.setPaymentId(custid, payData.id);
            return payData;
        } catch (err) {
            throw(err);
        }
    };

    async amendPaymentDetails(custid, body) {
        try {
            await PaymentModelInstance.amendPaymentDetails(custid, body);
            const data = await PaymentModelInstance.getPaymentDetails(custid);
            return data;
            
        } catch (err) {
            throw(err);
        }
    }
}

module.exports = PaymentService;