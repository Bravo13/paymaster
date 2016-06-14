var Paymaster = require('./index.js');
var client = new Paymaster({ mid:2388, secret:'123', hash_type:'sha256' });
var bill = {
	amount:123,
	desc:'test',
	test_mode:SIM_MODE_SUCCESS,
	pay_system: 18,
}
console.log(client.getPayUrl(bill));
var data = client.buildBillData(bill);
console.log('<form method="post" action="https://lmi.paymaster.ua/">');
for(var a in data){
	console.log('<input type="hidden" name="'+a+'" value="'+data[a]+'">');
}
console.log('<input type="submit" value="pay">');
console.log('</form>');
