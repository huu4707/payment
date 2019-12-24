var router = express.Router()
const uuidv1 = require('uuid/v1');
const https = require('https');
const config = require('../../config/momo.json');
const crypto = require('crypto');
let { endpoint, hostname, path, partnerCode, accessKey, serectkey, returnUrl, notifyurl, requestType, extraData } = config;

router.post('/create_payment_url', function (req, res, next) {
    let { orderInfo, amount } = req.body;
    var orderId = "12345678901"
    var requestId = "12345678901"
    var rawSignature = "partnerCode="+partnerCode+"&accessKey="+accessKey+"&requestId="+requestId+"&amount="+amount+"&orderId="+orderId+"&orderInfo="+orderInfo+"&returnUrl="+returnUrl+"&notifyUrl="+notifyurl+"&extraData="+extraData
    var signature = crypto.createHmac('sha256', serectkey)
                   .update(rawSignature)
                   .digest('hex');
    var body = JSON.stringify({
        partnerCode : partnerCode,
        accessKey : accessKey,
        requestId : requestId,
        amount : amount,
        orderId : orderId,
        orderInfo : orderInfo,
        returnUrl : returnUrl,
        notifyUrl : notifyurl,
        extraData : extraData,
        requestType : requestType,
        signature : signature,
    })

    var options = {
        url: hostname+path,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        },
        body
      };
      var request = require('request');
      request.post(options, function(error, response, body){
            if(error) {
                res.send({status: false, message: error.message, data: []});
            } else{
                let data = JSON.parse(body);
                let { errorCode, message, payUrl} = data;
                res.send({status: true, message: message, data: payUrl});
            }
      });
});

module.exports = router
