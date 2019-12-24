var router = express.Router()

var account = require('./account.js');
app.use("/account", account)

var user = require('./user.js');
app.use("/user", user)

var momo = require('./momo.js');
app.use("/momo", momo)

var vnpay = require('./vnpay.js');
app.use("/vnpay", vnpay)

module.exports = router