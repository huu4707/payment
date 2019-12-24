function ForgotPasswordModel(sequelize, type) {
    return sequelize.define('forgot_password', {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      token: type.STRING,
      expired: type.DATE,
    })
  }
  
  module.exports = {
    ForgotPasswordModel
  }