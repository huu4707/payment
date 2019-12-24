var router = express.Router()
var { User } = require('../../sequelize.js');
const Joi = require('joi');
const { reponseAPI } = require('../../lib/responseAPI');

router.get('/profile', async (req, res) => {
    if(req.user) {
        let result = reponseAPI(true, "Get profile success", req.user)
        return res.send(result);
    } else{
        let id = req.session.userid;
        let info = await User.findOne({ where : { id }});
        delete info.dataValues.password;
        if(info) {
            let result = reponseAPI(true, "Get profile success", info)
            return res.send(result);
        }
        let result = reponseAPI(true, "User not found", info)
        return res.send(result);
    }        
})


module.exports = router
