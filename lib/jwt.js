const jwt = require('jsonwebtoken');
const config = require('../config.json')

function verifyLogInToken(token){
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.JWT_TOKEN_SECRET_KEY, (err, obj) => {
            if (err) return reject(err);
            delete obj.iat;
            delete obj.exp;
            resolve(obj);
        });
    });
}

 function createToken(obj){
    return new Promise((resolve, reject) => {
        jwt.sign(obj, config.JWT_TOKEN_SECRET_KEY, { expiresIn: '7 days' }, (err, token) => {
            if (err) return reject(err);
            resolve(token);
        });
    });
}


module.exports = {
    verifyLogInToken,
    createToken
}