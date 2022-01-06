const jwt = require('jsonwebtoken');

const isAuthorized = async (req, res, next) => {
    //if(!req.cookies.jwt) return res.redirect('http://localhost:3000/');
    if(!req.cookies.jwt && req.path === '/login') {
        return next();
    } 
    try {
        const token = req.cookies.jwt;
        let secret = process.env.TOKEN_SECRET;
        const data = jwt.verify(token, secret, { algorithm: 'HS256'});
        if(parseInt(req.params.customerId) !== data.id) {
            req.isAuthorized = false;
            const error = new Error('Not Authorized!');
            error.status = 401;
            throw error;
        }
        req.userid = data.id
        req.isAuthorized = true;
        return next();
        
    } catch (err) {
        next(err)
    }  
}

module.exports = isAuthorized;