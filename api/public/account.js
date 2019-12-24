var router = express.Router()
var { User } = require('../../sequelize.js');
const Joi = require('joi');
const { createHash, compare } = require('../../lib/bcrypt');
const { reponseAPI } = require('../../lib/responseAPI');
const { createToken } = require('../../lib/jwt');
const FacebookStrategy  = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config = require('../../config.json')
const account = require('../../services/account');
let { sendMailTokenResetPassword } = require('../../lib/emailHelper');

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});
  
passport.use(new FacebookStrategy({
      clientID: config.FB_APP_ID,
      clientSecret:config.FB_APP_SECRET ,
      callbackURL: config.FB_CALLBACK_URL
},
function(accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        // console.log(accessToken, refreshToken, profile, done);
        return done(null, profile);
      });
    }
));
  
  
passport.use(new GoogleStrategy({
    clientID: config.GG_CLIENT_ID,
    clientSecret: config.GG_CLIENT_SECRET,
    callbackURL: config.GG_CALLBACK_URL,
    },
    function (token, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
})); 


function validate(body) {
    return new Promise((resolve, reject) => {
        const schema = Joi.object().keys({
            name: Joi.string().alphanum().min(3).max(30),
            email: Joi.string().email(),
            password: Joi.string().min(6).max(30),
        }).with('username', 'password');
        Joi.validate(body, schema, function (err, value) {
            if(err) {
                reject(err)
            } else{
                resolve(value);
            }
        });
    })
}

router.post('/register', async (req, res) => {
    try {
        await validate(req.body);
        let checkEmail= await User.findOne({ where: { email: req.body.email} });
        if(checkEmail) {
             let result = reponseAPI(false,"email is exits",[])
             return res.send(result);
        }
        req.body.password = await createHash(req.body.password);
        User.create(req.body)
        .then(user => {
            delete user.dataValues.password;
            let result = reponseAPI(true,"success",user)
            return res.send(result);
        })
    } catch (error) {
        let result = reponseAPI( false, error.message, [])
        return res.send(result);
    }
})

router.post('/login', async (req, res) => {
    try {
        await validate(req.body);
        let user = await User.findOne({ where: { email: req.body.email} });
        if(!user) {
             let result = reponseAPI(false,"email or password is vaild",[])
             return res.send(result);
        }
        await compare(req.body.password, user.dataValues.password);
        user.dataValues.token = await createToken({id: user.id});
        delete user.dataValues.password;
        let result = reponseAPI(true, "Success", user)
        return res.send(result);
    } catch (error) {
        let result = reponseAPI(false, error.message,[])
        return res.send(result);
    }
})

router.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));

router.get('/auth/facebook/callback',
	  passport.authenticate('facebook', { successRedirect : '/', failureRedirect: '/login' }),
	  function(req, res) {
        res.redirect('/');
});

router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login'}),
        function(req, res) {
          res.redirect('/');
});

router.post('/password/forgot',async function (req, res) {
    let email = req.body.email;
    let user = await User.findOne({where: {email}});
    if(user) {
        let token = await account.generateTokenResetPassword(user.dataValues);
        if(!token) {
            let result = reponseAPI(false,"Generate token error ",[])
            return res.send(result);
        }
        sendMailTokenResetPassword(email, user.dataValues.name, token);
        let result = reponseAPI(true, "We sent email reset your password! Please check your email!",[])
        return res.send(result);
    } else{
        let result = reponseAPI(false,"User email find not found!",[])
        return res.status(404).send(result);
    }
})

router.post('/password/forgot/change-password', async function (req, res) {
    try {
        let {
            token,
            newPassword,
            againPassword,
          } = req.body
          await validate({password: newPassword});
          if(newPassword!==againPassword) {
            let result = reponseAPI(false,"Retype password does not match",[])
            return res.send(result);
          }
          await  account.generateNewPassword(token, newPassword);
          let result = reponseAPI(true,"Password changed successfully!", [])
          return res.send(result)
    } catch (error) {
        let result = reponseAPI(false, error.message,[])
        return res.send(result);
    }
})

module.exports = router
