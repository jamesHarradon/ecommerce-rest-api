const jwt = require('jsonwebtoken');

const isProduction = process.env.NODE_ENV === 'production';
const url = isProduction ? process.env.CLIENT_URL : 'http://localhost:3000';

const isAuthorized = (req, res, next) => {
    
    try {
        const token = req.cookies.jwt_ukulele;
        let secret = process.env.TOKEN_SECRET;
        const data = jwt.verify(token, secret, { algorithm: 'HS256'});
        if(parseInt(req.params.customerId) !== data.id) {
            req.isAuthorized = false;
            const error = new Error('Not Authorized!');
            error.status = 401;
            throw error;
        }
        req.customerId = data.id
        req.isAuthorized = true;
        return next();
        
    } catch (err) {
        next(err)
    }  
}

module.exports = isAuthorized;