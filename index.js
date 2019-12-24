express = require('express');
passport = require('passport');
const session  = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
app = express();


app.use(cookieParser()); //Parse cookie
app.use(bodyParser.json())
app.use(session({ secret: 'keyboard cat', key: 'sid'}));  //Save user login
app.use(passport.initialize());
app.use(passport.session());
require('./api')

const port = 3000
app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`)
})