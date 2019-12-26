const { token_key, checksum_key, encrypt_key, returnUrl, cancelUrl, base_url_alepay, checkoutType } = require('../../config/alepay.json')
const md5 = require('md5')
const request = require('request');
var router = express.Router()

router.post('/create_payment_url', function (req, res, next) {
    let { orderCode, amount, currency, orderDescription, totalItem, buyerName, buyerEmail, buyerPhone, buyerAddress, buyerCity, buyerCountry, language } = req.body;
    let checksum = md5 (orderCode + amount + checkoutType + currency + returnUrl + checksum_key)
    let dataInput = {
        orderCode,
        amount,
        orderDescription,
        currency,
        totalItem,
        checkoutType,
        returnUrl,
        cancelUrl,
        buyerName,
        buyerEmail,
        buyerPhone,
        buyerAddress,
        buyerCity,
        buyerCountry,
        tokenKey: token_key,
        checksum,
        language,
    };
    var options = {
        url: `${base_url_alepay}/checkout/v2/request-order`,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(dataInput))
        },
        body: JSON.stringify(dataInput)
      };
      request.post(options, function(error, response, body){
            let { errorCode, data } = JSON.parse(body);
            let { transactionCode, checkoutUrl } = data;
            if(errorCode === "000") {
                res.send({status: true, message: "Success", data: checkoutUrl});
            } else {
                res.send({status: false, message: "Có lỗi khi giao dich", data: null });
            }
      });
});

router.get('/webhook', function (req, res, next) {
    let { errorCode, transactionCode, cancel } = req.query;
    let checksum = md5(transactionCode + checksum_key);
    let dataInput = { transactionCode, tokenKey: token_key, checksum };
    var options = {
        url: `${base_url_alepay}/checkout/v2/get-transaction-info`,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(dataInput))
        },
        body: JSON.stringify(dataInput)
      };
      request.post(options, function(error, response, body){
            console.log('body', body)
            //tra respone
            
      });
});
module.exports = router