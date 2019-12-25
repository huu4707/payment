
var router = express.Router()
const crypto = require('crypto');
const uuidv1 = require('uuid/v1');
const fetch = require('node-fetch');
const { parseString } = require('xml2js');
const { paymentGateway, merchant, receiverEmail, secureSecret, returnUrl, cancelUrl, paymentMethod, version } = require('../../config/nganluong.json')

router.post('/create_payment_url', function (req, res, next) {
    let feeShipping = "0";
    let discountAmount = "0"
    let taxAmount = "0"
    let orderId = uuidv1();
    let { bankCode, amount, orderInfo, locale, currency, customerEmail } = req.body;
    let secureHash = crypto.createHash('md5').update(secureSecret).digest('hex');
    const arrParam = {
        function               : "SetExpressCheckout",
        cur_code               : currency ? currency.toLowerCase() : 'vnd',
        version                : version,
        merchant_id            : merchant,
        receiver_email         : receiverEmail,
        merchant_password      : secureHash,
        order_code             : orderId,
        total_amount           : String(amount),
        payment_method         : paymentMethod,
        bank_code              : bankCode,
        order_description      : orderInfo,
        tax_amount             : taxAmount,
        fee_shipping           : feeShipping || '0',
        discount_amount        : discountAmount || '0',
        return_url             : returnUrl,
        cancel_url             : cancelUrl,
        buyer_email            : customerEmail,
        lang_code              : locale,
    };
    const params = coverParam(arrParam);
    const options = {
        method: 'POST',
    };
    fetch(`${paymentGateway}?${params.join('&')}`, options)
    .then(rs => rs.text())
    .then(rs => {
        parseString(rs, (err, result) => {
            const objectResponse = result.result || {};
            console.log('objectResponse', objectResponse)
            if (objectResponse.error_code[0] === '00') {
                let href =  objectResponse.checkout_url[0];
                res.send({status: true, message: "Thành công", data: href })
            } else {
                let error =  objectResponse.description[0];
                res.send({status: true, message: error, data: null })
            }
        });
    });
});

function coverParam(arrParam) {
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
    return params;
}

router.get('/webhook', function (req, res, next) {
    let { token } = req.query;
    let secureHash = crypto.createHash('md5').update(secureSecret).digest('hex');
    const arrParam = {
        merchant_id            : merchant,
        merchant_password      : secureHash,
        version                : version,
        function               : 'GetTransactionDetail',
        token,
    };
    const params = coverParam(arrParam);
    const options = {
        method: 'POST',
    };
    fetch(`${paymentGateway}?${params.join('&')}`, options)
				.then(rs => rs.text())
				.then(rs => {
					parseString(rs, (err, result) => {
						const objectResponse = result.result || {};
						if (objectResponse.error_code[0] === '00') {
							objectResponse.merchant = data.nganluongMerchant;
							const returnObject = _mapQueryToObject(objectResponse);
							//thanh công
						} else {
							let error = _mapQueryToObject(objectResponse);
							//Có lỗi
						}
					});
				});
});

function _mapQueryToObject(query) {
    const returnObject = {};
    Object.keys(query).forEach(key => {
        returnObject[key] = query[key][0];
    });

    return Object.assign({}, returnObject, {
        merchant: returnObject.merchant,
        transactionId: returnObject.order_code,
        amount: returnObject.total_amount,
        orderInfo: returnObject.order_description,
        responseCode: returnObject.transaction_status,
        bankCode: returnObject.bank_code,
        gatewayTransactionNo: returnObject.transaction_id,
        message: returnObject.description || getReturnUrlStatus(returnObject.error_code),
        customerEmail: returnObject.buyer_email,
        customerPhone: returnObject.buyer_mobile,
        customerName: returnObject.buyer_fullname,
    });
}

function getReturnUrlStatus(responseCode, locale = 'vn') {
    const responseCodeTable = {
        '00': {
            vn: 'Giao dịch thành công',
            en: 'Approved',
        },
        '02': {
            vn: 'Địa chỉ IP của merchant gọi tới NganLuong.vn không được chấp nhận',
            en: 'Invalid IP Address',
        },
        '03': {
            vn: 'Sai tham số gửi tới NganLuong.vn (có tham số sai tên hoặc kiểu dữ liệu)',
            en: 'Sent data is not in the right format',
        },
        '04': {
            vn: 'Tên hàm API do merchant gọi tới không hợp lệ (không tồn tại)',
            en: 'API function name not found',
        },
        '05': {
            vn: 'Sai version của API',
            en: 'Wrong API version',
        },
        '06': {
            vn: 'Mã merchant không tồn tại hoặc chưa được kích hoạt',
            en: 'Merchant code not found or not activated yet',
        },
        '07': {
            vn: 'Sai mật khẩu của merchant',
            en: 'Wrong merchant password',
        },
        '08': {
            vn: 'Tài khoản người bán hàng không tồn tại',
            en: 'Seller account not found',
        },
        '09': {
            vn: 'Tài khoản người nhận tiền đang bị phong tỏa',
            en: 'Receiver account is frozen',
        },
        10: {
            vn: 'Hóa đơn thanh toán không hợp lệ',
            en: 'Invalid payment bill',
        },
        11: {
            vn: 'Số tiền thanh toán không hợp lệ',
            en: 'Invalid amount',
        },
        12: {
            vn: 'Đơn vị tiền tệ không hợp lệ',
            en: 'Invalid money currency',
        },
        29: {
            vn: 'Token không tồn tại',
            en: 'Token not found',
        },
        80: {
            vn: 'Không thêm được đơn hàng',
            en: "Can't add more order",
        },
        81: {
            vn: 'Đơn hàng chưa được thanh toán',
            en: 'The order has not yet been paid',
        },
        110: {
            vn: 'Địa chỉ email tài khoản nhận tiền không phải email chính',
            en: 'The email address is not the primary email',
        },
        111: {
            vn: 'Tài khoản nhận tiền đang bị khóa',
            en: 'Receiver account is locked',
        },
        113: {
            vn: 'Tài khoản nhận tiền chưa cấu hình là người bán nội dung số',
            en: 'Receiver account is not configured as digital content sellers',
        },
        114: {
            vn: 'Giao dịch đang thực hiện, chưa kết thúc',
            en: 'Pending transaction',
        },
        115: {
            vn: 'Giao dịch bị hủy',
            en: 'Cancelled transaction',
        },
        118: {
            vn: 'tax_amount không hợp lệ',
            en: 'Invalid tax_amount',
        },
        119: {
            vn: 'discount_amount không hợp lệ',
            en: 'Invalid discount_amount',
        },
        120: {
            vn: 'fee_shipping không hợp lệ',
            en: 'Invalid fee_shipping',
        },
        121: {
            vn: 'return_url không hợp lệ',
            en: 'Invalid return_url',
        },
        122: {
            vn: 'cancel_url không hợp lệ',
            en: 'Invalid cancel_url',
        },
        123: {
            vn: 'items không hợp lệ',
            en: 'Invalid items',
        },
        124: {
            vn: 'transaction_info không hợp lệ',
            en: 'Invalid transaction_info',
        },
        125: {
            vn: 'quantity không hợp lệ',
            en: 'Invalid quantity',
        },
        126: {
            vn: 'order_description không hợp lệ',
            en: 'Invalid order_description',
        },
        127: {
            vn: 'affiliate_code không hợp lệ',
            en: 'Invalid affiliate_code',
        },
        128: {
            vn: 'time_limit không hợp lệ',
            en: 'Invalid time_limit',
        },
        129: {
            vn: 'buyer_fullname không hợp lệ',
            en: 'Invalid buyer_fullname',
        },
        130: {
            vn: 'buyer_email không hợp lệ',
            en: 'Invalid buyer_email',
        },
        131: {
            vn: 'buyer_mobile không hợp lệ',
            en: 'Invalid buyer_mobile',
        },
        132: {
            vn: 'buyer_address không hợp lệ',
            en: 'Invalid buyer_address',
        },
        133: {
            vn: 'total_item không hợp lệ',
            en: 'Invalid total_item',
        },
        134: {
            vn: 'payment_method, bank_code không hợp lệ',
            en: 'Invalid payment_method, bank_code',
        },
        135: {
            vn: 'Lỗi kết nối tới hệ thống ngân hàng',
            en: 'Error connecting to banking system',
        },
        140: {
            vn: 'Đơn hàng không hỗ trợ thanh toán trả góp',
            en: 'The order does not support installment payments',
        },
        99: {
            vn: 'Lỗi không được định nghĩa hoặc không rõ nguyên nhân',
            en: 'Unknown error',
        },
        default: {
            vn: 'Giao dịch thất bại',
            en: 'Failured',
        },
    };

    const respondText = responseCodeTable[responseCode];

    return respondText ? respondText[locale] : responseCodeTable.default[locale];
}
module.exports = router
