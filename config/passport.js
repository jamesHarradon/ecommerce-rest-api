const passport = require('passport');

require('dotenv').config();

const CustomerService = require('../newStructure/services/customer-service');

const CustomerServiceInstance = new CustomerService;

const GoogleStrategy = require('passport-google-oauth20').Strategy

//takes id from postgres table and serializes it ready to pass to a session cookie
passport.serializeUser((user, callback) => {
    callback(null, user);
});

//gets id stored in cookie to verify against entry in db table, saves id in req.user.
passport.deserializeUser(async (id, callback) => {
    try {
        const userData = await CustomerModelInstance.getCustomerData(id);
        const email = userData.email;
        const user = await CustomerModelInstance.checkExistingEmail(email);
        callback(null, user);
    } catch (err) {
        console.log(err);
    }
})

passport.use(new GoogleStrategy({
    //options for strategy
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/auth/google/redirect'
}, async (accessToken, refreshToken, profile, cb) => {
    //passport callback
    try {
        //finds existing user or registers user to db
        const user = await CustomerServiceInstance.googleRegister({first_name: profile.name.givenName, last_name: profile.name.familyName, email: profile.emails[0].value, password: null, google_id: profile.id});
        
        //callback func (similar to next) is called inside passport.serializeUser above;
        return cb(null, user.id);
        
    } catch (err) {
        console.log(err);
    }
    
}));