var router = express.Router()
const uuidv1 = require('uuid/v1');
const https = require('https');
const config = require('../../config/momo.json');
const crypto = require('crypto');
let { endpoint, hostname, path, partnerCode, accessKey, serectkey, returnUrl, notifyurl, requestType, extraData } = config;

router.post('/create_payment_url', function (req, res, next) {
    let { orderInfo, amount, bankCode } = req.body;
    var orderId = "1234567890111012" // tao đơn hàng
    var requestId = "1234567890111012"
    // let requestType = "captureMoMoWallet"; // thanh toán bang môm
    if(requestType == "payWithMoMoATM") { //the ngan hang
        var rawSignature = "partnerCode="+partnerCode+"&accessKey="+accessKey+"&requestId="+requestId+"&bankCode="+bankCode+"&amount="+amount+"&orderId="+orderId+"&orderInfo="+orderInfo+"&returnUrl="+returnUrl+"&notifyUrl="+notifyurl+"&extraData="+extraData+"&requestType="+requestType
    } else{//qr momo
        var rawSignature = "partnerCode="+partnerCode+"&accessKey="+accessKey+"&requestId="+requestId+"&amount="+amount+"&orderId="+orderId+"&orderInfo="+orderInfo+"&returnUrl="+returnUrl+"&notifyUrl="+notifyurl+"&extraData="+extraData
    }
    var signature = crypto.createHmac('sha256', serectkey)
        .update(rawSignature)
        .digest('hex');
    var body = JSON.stringify({
        partnerCode : partnerCode,
        bankCode,
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
            console.log('body', body)
            if(error) {
                res.send({status: false, message: error.message, data: []});
            } else{
                let data = JSON.parse(body);
                let { errorCode, message, payUrl} = data; //lấy payUrl cho user quét qr
                res.send({status: true, message: message, data: payUrl});
            }
      });
});

router.get('/webhook', function (req, res, next) {
    let { signature, amount, orderId, message, localMessage, errorCode, payType, orderInfo} = req.query;
    var rawSignature = ".......";//nhat viet lại
    var checkHash = crypto.createHmac('sha256', serectkey).update(rawSignature).digest('hex');
    if(signature === checkHash) {
        //xu ly
    }
});
module.exports = router
