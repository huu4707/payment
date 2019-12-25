const fetch = require('node-fetch');
const { token_key, checksum_key, encrypt_key, returnUrl, cancelUrl, base_url_alepay } = require('./config/alepay.json')
const NodeRSA = require('node-rsa');
const md5 = require('md5')
// let orderCode = uuidv1();

const dataInput = {
    orderCode: 'ORD00011U',
    amount: 90000,
    orderDescription: 'Thanh toan giay adidas',
    currency: 'VND',
    totalItem: "5",
    checkoutType: "1",
    bankCode:"JCB",
    returnUrl,
    cancelUrl,
    buyerEmail: "nth47@gmail.com",
    paymentMethod: "ATM_ON",
    buyerPhone: "0389286846",
    buyerAddress:"HCM",
    buyerCity:"HCM",
    buyerCountry:"VIET NAM",
};

const pubKey = '-----BEGIN PUBLIC KEY-----'+
                        encrypt_key+
                '-----END PUBLIC KEY-----';
const key = new NodeRSA(pubKey, {encryptionScheme: 'pkcs1'});
const dataEncrypt = key.encrypt(JSON.stringify(dataInput), 'base64');
let Checksum = md5(dataEncrypt + checksum_key)

let arrParam = {
    token : token_key,
    data: dataEncrypt,
    Checksum
}


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


fetch(`${base_url_alepay}/checkout/v1/request-order?${params.join('&')}`, options)
.then(rs => {
    console.log('rs', rs)
})


