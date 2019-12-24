const bcrypt = require('bcrypt');
const saltRounds = 10;

function createHash(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function(err, hash) {
            if(!err) {
                resolve(hash)
            } else{
                reject(err)
            }
        });
    })
}

function compare(password, hash ) {
    return new Promise(( resolve, reject) => {
        bcrypt.compare(password, hash, function(err, res) {
            if(!err) {
                if(res){
                    return resolve(res)
                }
            }
            return reject({
                type: "MY_ERROR",
                message: "username or password is vaild"
            })
        });
    })
}
module.exports = {
    createHash,
    compare
}