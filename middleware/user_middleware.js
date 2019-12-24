const { reponseAPI } = require('../lib/responseAPI');
const { User } = require('../sequelize');
const { verifyLogInToken } = require('../lib/jwt')

app.use(async function (req, res, next) {
    if (req.originalUrl.includes("/account") || req.user)
         next()
    else {
        let token = req.headers.token;
        if(!token) {
            let send = reponseAPI({status: false,message: "token empty" , data: []});
            res.send(send)
        } else{
            try {
                let data = await verifyLogInToken(token);
                let check = await User.findOne({where : { id : data.id }});
                if(check) {
                    req.session.userid = data.id;
                    return next();
                } 
                let send = reponseAPI({status: false,message: "user not exist" , data: []});
                res.send(send)
            } catch (error) {
                let send = reponseAPI({status: false,message: error.message , data: []});
                res.send(send)
            }
        }
    }
})

app.use(function (err, req, res, next) {
    var result = responseAPI(false, "Reponse fail from server! Please try again.", []);
    res.status(500)
    res.send(result);
})