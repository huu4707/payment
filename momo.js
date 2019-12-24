const uuidv1 = require('uuid/v1');
const https = require('https');
//parameters send to MoMo get get payUrl
var endpoint = "https://test-payment.momo.vn/gw_payment/transactionProcessor"
var hostname = "https://test-payment.momo.vn"
var path = "/gw_payment/transactionProcessor"
var partnerCode = "MOMO5QEV20191224"
var accessKey = "I5YhoyuUDMzsQqe9"
var serectkey = "tdr8Pt8s45EOSFCKOqfEjgtQ4spGn4jW"

var orderInfo = "pay with MoMo"
var returnUrl = "http://localhost:3000/"
var notifyurl = "http://localhost:3000/momo/webhook"

var amount = "50000"
var orderId = '12345678'
var requestId = '12345678'
var requestType = "captureMoMoWallet"
var extraData = "merchantName=;merchantId=" //pass empty value if your merchant does not have stores else merchantName=[storeName]; merchantId=[storeId] to identify a transaction map with a physical store
var rawSignature = "partnerCode="+partnerCode+"&accessKey="+accessKey+"&requestId="+requestId+"&amount="+amount+"&orderId="+orderId+"&orderInfo="+orderInfo+"&returnUrl="+returnUrl+"&notifyUrl="+notifyurl+"&extraData="+extraData
console.log('rawSignature', rawSignature)
const crypto = require('crypto');
var signature = crypto.createHmac('sha256', serectkey)
                   .update(rawSignature)
                   .digest('hex');
console.log('signature', signature)

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
//Create the HTTPS objects
var options = {
  hostname: 'test-payment.momo.vn',
  port: 443,
  path: '/gw_payment/transactionProcessor',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
 }
};

console.log('options', options)

//Send the request and get the response
console.log("Sending....")
var req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (body) => {
    console.log('Body');
    console.log(body);
    console.log('payURL');
    console.log(JSON.parse(body).payUrl);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.log(`problem with request: ${e.message}`);
});

// write data to request body
req.write(body);
req.end();
