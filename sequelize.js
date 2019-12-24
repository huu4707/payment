const Sequelize = require('sequelize')
const { UserModel } = require('./models/user')
const { ForgotPasswordModel } = require('./models/forgot_password')
const config = require('./config.json')

const sequelize = new Sequelize(config.VAR_DATABASE, config.VAR_USER, config.VAR_PASSWORD, {
  host: config.VAR_HOST,
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

const User = UserModel(sequelize, Sequelize)
const ForgotPassword = ForgotPasswordModel(sequelize, Sequelize)
ForgotPassword.belongsTo(User); //tao userId trong blog

sequelize.sync({ force: false })
  .then(() => {
    console.log(`Database & tables created!`)
  })

module.exports = {
  User,
  ForgotPassword
}