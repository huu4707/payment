const crypto = require('crypto');
const fetch = require('node-fetch');
const { parseString } = require('xml2js');
const { paymentGateway, merchant, receiverEmail, secureSecret, returnUrl, cancelUrl } = require('./config/nganluong.json')
const data = {
    orderId: 'node-2018-01-22T05:05:17.266Z',
    transactionId: 'node-2018-01-22T05:05:17.266Z',
    amount: 90000,
    bankCode: 'BAB',
    paymentMethod: 'ATM_ONLINE',
    orderInfo: 'Thanh toan giay adidas',
    locale: 'vi',
    currency: 'VND',
    customerId: 'thanhvt',
    // clientIp: '127.0.0.1',
    // customerName: 'Tú Địch',
    customerEmail: 'tu.nguyen@naustud.io',
    // customerPhone: '0999999999',
};

let secureHash = crypto
.createHash('md5')
.update(secureSecret)
.digest('hex');
const arrParam = {
    function               : "SetExpressCheckout",
    cur_code               : data.currency ? data.currency.toLowerCase() : 'vnd',
    version                : "3.1",
    merchant_id            : merchant,
    receiver_email         : receiverEmail,
    merchant_password      : secureHash,
    order_code             : data.orderId,
    total_amount           : String(data.amount),
    payment_method         : data.paymentMethod,
    bank_code              : data.bankCode,
    order_description      : data.orderInfo,
    tax_amount             : data.taxAmount,
    fee_shipping           : data.feeShipping || '0',
    discount_amount        : data.discountAmount || '0',
    return_url             : returnUrl,
    cancel_url             : cancelUrl,
    buyer_email            : data.customerEmail,
    time_limit             : "2",
    // lang_code              : data.locale,
    // affiliate_code         : "220",
};

const params = [];
Object.keys(arrParam).forEach(key => {
    const value = arrParam[key];
    if (value == null || value.length === 0) {
        return;
    }

    if (value.length > 0) {
        params.push(`${key}=${encodeURI(value)}`);
    }
});

const options = {
    method: 'POST',
};

fetch(`${paymentGateway}?${params.join('&')}`, options)
.then(rs => rs.text())
.then(rs => {
    parseString(rs, (err, result) => {
        const objectResponse = result.result || {};
        if (objectResponse.error_code[0] === '00') {
            let href =  objectResponse.checkout_url[0];
            console.log('objectResponse', objectResponse)
            console.log('href', href)
        } else {
            let error =  objectResponse.description[0];
            console.log('error', error)
        }
    });
});