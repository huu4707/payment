const generator = require('generate-password');
const md5 = require('md5');
const { ForgotPassword, User } = require('../sequelize');
const moment = require('moment')
const { createHash } = require('../lib/bcrypt');

generateTokenResetPassword = function (user) {
    return new Promise((resolve, reject) => {
        var token = generator.generate({
            length: 10,
            numbers: true,
          });        
          token = md5(token)
          let expired = moment().add(5, 'm').toDate();// 5p
          ForgotPassword.create({token, expired, userId : user.id})
          .then(data => {
            if(data) {
                return resolve(token);
            }
            resolve(false); 
          })
          .catch(err => {
              reject(err)
          })
    })
}

generateNewPassword = function (token, newPassword) {
    return new Promise(async (resovle, reject) => {
        let info = await ForgotPassword.findOne({
            where: { token },
            include: [{
                model: User,
            }]
        })
        if(info){
            if (moment(info.expired).valueOf() < moment().valueOf()) {
                return reject({
                        type: "MY_ERROR",
                        message: "Generate password is expired! Please try click forgot password agian"
                    })
            }
            let user = info.user;
            let result = User.update({password: await createHash(newPassword)}, { where: { id: user.id}});
            if(!result) {
                return reject({
                    type: "MY_ERROR",
                    message: "Update password fail"
                })
            }
            return resovle(true)
        }
        return reject({
            type: "MY_ERROR",
            message: "Token invalid"
        })
    })

}
module.exports = {
    generateTokenResetPassword,
    generateNewPassword
}