/* Test modes
 * 1 - always success payment
 * 2 - always fail payment
 * 3 - 80% success, 20% fail
* */
global.SIM_MODE_SUCCESS = 1;
global.SIM_MODE_FAIL    = 2;
global.SIM_MODE_MIDDLE  = 3;

var crypto = require('crypto');

/* all available arguments for payment form
 */
var fields = {
	mid: {
		title: 'LMI_MERCHANT_ID',
		validator: /^[\d]+$/,
	},
	amount: {
		title: 'LMI_PAYMENT_AMOUNT',
		validator: /^[\d\.]+$/,
	},
	order_id: {
		title: 'LMI_PAYMENT_NO',
	},
	desc: {
		title: 'LMI_PAYMENT_DESC',
		validator: /[\w\W]{1,255}/,
	},
	desc_b64: {
		title: 'LMI_PAYMENT_DESC_BASE64',
	},
	success_url: {
		title: 'LMI_SUCCESS_URL',
	},
	success_method: {
		title: 'LMI_SUCCESS_METHOD',
		validator: /^(get|post)$/i,
	},
	fail_url: {
		title: 'LMI_FAIL_URL',
	},
	fail_method: {
		title: 'LMI_FAIL_METHOD',
		validator: /^(get|post)$/i,
	},
	expires: {
		title: 'LMI_EXPIRES',
	},
	pay_system: {
		title: 'LMI_PAYMENT_SYSTEM',
	},
	test_mode: {
		title: 'LMI_SIM_MODE',
	},
	phone: {
		title: 'LMI_PAYER_PHONE_NUMBER',
		validator: /^380\d{9}$/,
	},
	email: {
		title: 'LMI_PAYER_EMAIL',
	},
}

function Paymaster( config ) {
	this.mid = config.mid;
	this.secret = config.secret;
	this.hash_type = config.hash_type;
	return this;
}

Paymaster.prototype.makeHash = function( config ){

	var string = config.mid + config.order_id + config.amount + this.secret;

	switch(this.hash_type.toLowerCase()) {
		case 'sha256':	return crypto.createHash('sha256').update(string).digest('hex');
		default: return new Error('Incorrect hash type '+this.hashType);
	}
}

Paymaster.prototype.buildBillData = function( config ) {
	if( config['amount'] === undefined || !/[\d+\.]+/.test(config.amount) )
		return new Error('Amount not defined');

	if( config['desc'] === undefined && config['desc_b64'] === undefined )
		return new Error('No description or base64-encoded description');

	if( this.mid === undefined && !/^\d+$/.test(this.mid) )
		return new Error('No merchant id');

	var data = {};
	var url_parts = [];
	for(var i in config){
		var key = i;
		var value = config[i];
		if( fields[i] != undefined ){
			key = fields[i].title;
			if(fields[i].validator !== undefined && !fields[i].validator.test(value))
				return new Error('Incorrect value "'+value+'" for field "'+i+'"');
		}
		data[key] = value;
	}

	data.LMI_HASH = this.makeHash(config);
	data.LMI_MERCHANT_ID = this.mid;
	return data;
}

Paymaster.prototype.getPayUrl = function( config ){
	if( config['lang'] === undefined || !/(en|ru|uk)/.test(config.lang) )
		config.lang = 'en';

	var billData = this.buildBillData(config);

	return 'https://lmi.paymaster.ua/'+config.lang+'/?'+Object.keys(billData).map(function(element){ return element+'='+billData[element] }).join('&');
}


module.exports = Paymaster;
