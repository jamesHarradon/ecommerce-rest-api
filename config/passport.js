const passport = require('passport');

require('dotenv').config();

const CustomerService = require('../newStructure/services/customer-service');
const CustomerModel = require('../newStructure/models/customer-model');

const CustomerServiceInstance = new CustomerService;
const CustomerModelInstance = new CustomerModel;

const GoogleStrategy = require('passport-google-oauth20').Strategy

passport.use(new GoogleStrategy({
    //options for strategy
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:4000/api/auth/google/redirect'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let bodyData = {first_name: profile.name.givenName, last_name: profile.name.familyName, email: profile.emails[0].value, password: null, google_id: profile.id};
        console.log(bodyData);
        // finds cust id in db from google id or creates new account and gets cust id to put in cookie
        const userData = await CustomerServiceInstance.googleLoginRegister(bodyData); 
        // saves id to req.user
        done(null, userData.id);
    } catch (err) {
        console.log(err);
    }

}));