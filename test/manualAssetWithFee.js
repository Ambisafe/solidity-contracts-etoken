var TestHelper = new (function() {
  // Convert number to 32 bytes hex representation.
  this.bytes32 = function(number) {
    var zeros = '000000000000000000000000000000000000000000000000000000000000000';
    var hexNumber = number.toString(16);
    return '0x' + (zeros + hexNumber).substring(hexNumber.length - 1);
  };

  // Represents `sha3` function from Solidity.
  this.sha3 = function() {
    var str = "";
    for (var i = 0; i < arguments.length; i++) {
      var hex = web3.toHex(arguments[i]).substr(2);  
      str += hex.length % 2 !== 0 ? "0" + hex : hex;
    }
    return "0x" + web3.sha3(str, {encoding: 'hex'});
  };
});
var sha3 = TestHelper.sha3;
var bytes32 = TestHelper.bytes32;

var acc = function(num) { return web3.eth.accounts[num || 0]; };

var _proxyfeeSetup = web3.eth.contract().at("");

var ambi = web3.eth.contract([{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"owners","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_node","type":"bytes32"}],"name":"removeNode","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"relationIndex","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"nodes","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"bytes32"}],"name":"setRelation","outputs":[{"name":"","type":"int8"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getNodeAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_addr","type":"address"}],"name":"changeNodeAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_addr","type":"address"}],"name":"addNode","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_operation","type":"bytes32"},{"name":"_signer","type":"bytes32"}],"name":"isSigned","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"bytes32"}],"name":"isRelation","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"}],"name":"getChildCount","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"address"}],"name":"hasRelation","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_pos","type":"uint8"}],"name":"getChildAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"nodeIndex","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"addresses","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"relations","outputs":[{"name":"relation","type":"bytes32"},{"name":"parent","type":"bytes32"},{"name":"numChildren","type":"uint8"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"bytes32"}],"name":"removeChild","outputs":[{"name":"","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"}]).at("");

var treasury = web3.eth.contract([{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_client","type":"uint256"}],"name":"isActiveClient","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"ambi","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_client","type":"uint256"},{"name":"_amount","type":"uint256"},{"name":"_token","type":"uint256"}],"name":"credit","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_client","type":"uint256"},{"name":"_amount","type":"uint256"},{"name":"_product","type":"uint256"}],"name":"withdraw","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_ambi","type":"address"},{"name":"_name","type":"bytes32"}],"name":"setAmbiAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[],"name":"remove","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_client","type":"uint256"},{"name":"_active","type":"bool"}],"name":"setActive","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"clients","outputs":[{"name":"balance","type":"uint256"},{"name":"active","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"token","type":"uint256"},{"indexed":false,"name":"value1","type":"uint256"},{"indexed":false,"name":"value2","type":"bool"}],"name":"Activate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Credit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"product","type":"uint256"}],"name":"Charge","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"uint256"}],"name":"LowBalance","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"uint256"}],"name":"ChargeError","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"code","type":"uint256"}],"name":"Error","type":"event"}]).at("");

var etok = web3.eth.contract([{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_switch","type":"bytes32"}],"name":"isEnabled","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"},{"name":"enabled","type":"bool"},{"name":"_symbol","type":"bytes32"}],"name":"setProxy","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_symbol","type":"bytes32"},{"name":"_value","type":"uint256"},{"name":"_name","type":"string"},{"name":"_description","type":"string"},{"name":"_baseUnit","type":"uint8"},{"name":"_isReissuable","type":"bool"}],"name":"issueAsset","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_holder","type":"address"}],"name":"getHolderId","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"},{"name":"_sender","type":"address"}],"name":"proxyApprove","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"},{"name":"_reference","type":"string"},{"name":"_sender","type":"address"}],"name":"proxyTransferFromWithReference","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"address"},{"name":"_spender","type":"address"},{"name":"_symbol","type":"bytes32"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"},{"name":"_symbol","type":"bytes32"}],"name":"setCosignerAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"isCreated","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"},{"name":"_symbol","type":"bytes32"}],"name":"setEventsProxy","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"},{"name":"_reference","type":"string"}],"name":"transferFromWithReference","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_only","type":"bool"},{"name":"_symbol","type":"bytes32"}],"name":"setOnlyProxy","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"}],"name":"trust","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_holder","type":"address"},{"name":"_symbol","type":"bytes32"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"}],"name":"changeContractOwnership","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"},{"name":"_reference","type":"string"},{"name":"_sender","type":"address"}],"name":"proxyTransferWithReference","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"},{"name":"_sender","type":"address"}],"name":"proxyTransferFrom","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"},{"name":"_reference","type":"string"}],"name":"proxyTransferDirect","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"}],"name":"recover","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"}],"name":"isTrusted","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"name","outputs":[{"name":"","type":"string"}],"type":"function"},{"constant":true,"inputs":[],"name":"holdersCount","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"},{"name":"_reference","type":"string"}],"name":"transferWithReference","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_switch","type":"bytes32"},{"name":"_state","type":"bool"}],"name":"setSwitch","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"lastOperation","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"assets","outputs":[{"name":"owner","type":"uint256"},{"name":"totalSupply","type":"uint256"},{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"isReissuable","type":"bool"},{"name":"baseUnit","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[],"name":"signChecks","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"switches","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[],"name":"distrustAll","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"description","outputs":[{"name":"","type":"string"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"isReissuable","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_symbol","type":"bytes32"},{"name":"_value","type":"uint256"}],"name":"revokeAsset","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"}],"name":"setCosignerAddressForUser","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"contractOwner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"},{"name":"_symbol","type":"bytes32"}],"name":"setCosignerAddressForAsset","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"},{"name":"_sender","type":"address"}],"name":"proxyTransfer","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"baseUnit","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":false,"inputs":[{"name":"_symbol","type":"bytes32"},{"name":"_value","type":"uint256"}],"name":"reissueAsset","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_symbol","type":"bytes32"}],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"}],"name":"distrust","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_symbol","type":"bytes32"},{"name":"_newOwner","type":"address"}],"name":"changeOwnership","outputs":[{"name":"","type":"bool"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":true,"name":"symbol","type":"bytes32"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"reference","type":"string"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"symbol","type":"bytes32"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"by","type":"address"}],"name":"Issue","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"symbol","type":"bytes32"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"by","type":"address"}],"name":"Revoke","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":true,"name":"symbol","type":"bytes32"}],"name":"OwnershipChange","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":true,"name":"symbol","type":"bytes32"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approve","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"by","type":"address"}],"name":"Recovery","type":"event"}]).at("");

var proxyfee = web3.eth.contract().at("");

etok.issueAsset("TST", 10000000, "test", "descr", 2, false, {from: acc()});
etok.balanceOf.call(acc(), "TST").toNumber() == 10000000;
etok.setProxy(proxyfee.address, true, "TST", {from: acc()});
etok.setEventsProxy.call(proxyfee.address, "TST", {from: acc()});
etok.setEventsProxy(proxyfee.address, "TST", {from: acc()});

proxyfee.init(etok.address, "TST", {from: acc()});
proxyfee.balanceOf.call(acc()).toNumber() == 10000000;

treasury.setAmbiAddress(ambi.address, "treasury", {from: acc()});
ambi.getNodeAddress.call("treasury").valueOf() == treasury.address;
ambi.addNode("dev", acc(), {from: acc()});
ambi.getNodeAddress.call("dev").valueOf() == acc();
ambi.setRelation("treasury", "admin", "dev", {from: acc()});
ambi.isRelation.call("treasury", "admin", "dev");
ambi.addNode("proxyfee", proxyfee.address, {from: acc()});
ambi.getNodeAddress.call("proxyfee").valueOf() == proxyfee.address;
ambi.setRelation("treasury", "refunder", "proxyfee", {from: acc()}); // Will change!
ambi.isRelation.call("treasury", "refunder", "proxyfee");

!treasury.isActiveClient.call(1);
treasury.credit(0, web3.toWei(10, 'ether'), 1, {from: acc(), value: web3.toWei(10, 'ether')});
web3.eth.getBalance(treasury.address) == web3.toWei(10, 'ether');
treasury.isActiveClient.call(1).valueOf();

ambi.setRelation("treasury", sha3("client", bytes32(1)), "proxyfee", {from: acc()}); // Might change!
ambi.isRelation.call("treasury", sha3("client", bytes32(1)), "proxyfee").valueOf()

web3.eth.getBalance(proxyfee.address).toNumber() == 0;
treasury.withdraw.call(proxyfee.address, 1, 1, 0, {from: proxyfee.address}).valueOf();

console.log("1 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferCallGas(acc(1), 1000, {from: acc()})).gasUsed);
console.log("2 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferFromCallGas(acc(1), acc(2), 1000, {from: acc()})).gasUsed);
console.log("3 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferWithReferenceCallGas(acc(1), 1000, "a", {from: acc()})).gasUsed);
console.log("4 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferFromWithReferenceCallGas(acc(1), acc(2), 1000, "a", {from: acc()})).gasUsed);
console.log("5 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getApproveCallGas(acc(1), 1000, {from: acc()})).gasUsed);
console.log("6 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getConfirmCallGas(acc(1), sha3("o"), acc(), 1000, 100, sha3("r"), sha3("s"), {from: acc()})).gasUsed);

proxyfee.setOperationsCallGas(
  web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferCallGas(acc(1), 1000, {from: acc()})).gasUsed,
  web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferFromCallGas(acc(1), acc(2), 1000, {from: acc()})).gasUsed,
  web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferWithReferenceCallGas(acc(1), 1000, "a", {from: acc()})).gasUsed,
  web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferFromWithReferenceCallGas(acc(1), acc(2), 1000, "a", {from: acc()})).gasUsed,
  web3.eth.getTransactionReceipt(_proxyfeeSetup.getApproveCallGas(acc(1), 1000, {from: acc()})).gasUsed,
  web3.eth.getTransactionReceipt(_proxyfeeSetup.getConfirmCallGas(acc(1), sha3("o"), acc(), 1000, 100, sha3("r"), sha3("s"), {from: acc()})).gasUsed,
  {from: acc()}
);

console.log(proxyfee.transferCallGas.call().toNumber() > 23000);
console.log(proxyfee.transferCallGas.call().toNumber() < 24000);
console.log(proxyfee.transferFromCallGas.call().toNumber() > 24000);
console.log(proxyfee.transferFromCallGas.call().toNumber() < 25000);
console.log(proxyfee.transferWithReferenceCallGas.call().toNumber() > 23000);
console.log(proxyfee.transferWithReferenceCallGas.call().toNumber() < 25000);
console.log(proxyfee.transferFromWithReferenceCallGas.call().toNumber() > 25000);
console.log(proxyfee.transferFromWithReferenceCallGas.call().toNumber() < 27000);
console.log(proxyfee.approveCallGas.call().toNumber() > 22000);
console.log(proxyfee.approveCallGas.call().toNumber() < 24000);
console.log(proxyfee.confirmCallGas.call().toNumber() > 28000);
console.log(proxyfee.confirmCallGas.call().toNumber() < 30000);

var feeAddress = acc(3);
var gasPrice = web3.toBigNumber(web3.toWei(20, 'gwei'));

proxyfee.setWholeTokenPrice(web3.toWei(0.01, 'ether'), {from: acc()});
proxyfee.tokenPriceInWei.call().eq(web3.toBigNumber(web3.toWei(0.01, 'ether')).div(100));
proxyfee.setupTreasury.call(treasury.address, 1, {from: acc()});
proxyfee.setupTreasury(treasury.address, 1, {from: acc()});
proxyfee.setupFee.call(feeAddress, {from: acc()});
proxyfee.setupFee(feeAddress, {from: acc()});
proxyfee.updateFeeGas.call(0, {from: acc()}).toNumber() > 0;
proxyfee.updateFeeGas(0, {from: acc()});
proxyfee.updateFeeGas.call(0, {from: acc()}).toNumber() > 0;
proxyfee.updateFeeGas(0, {from: acc()});
proxyfee.feeGas.call({from: acc()}).toNumber() < 23000;
proxyfee.updateRefundGas.call(0, {from: acc()}).toNumber() > 0;
proxyfee.updateRefundGas(0, {from: acc()});
proxyfee.refundGas.call({from: acc()}).toNumber() < 19000;

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transfer.estimateGas(acc(1), 100, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transfer.call(acc(1), 100, {from: acc(), gasPrice: gasPrice}));
var transfer1 = web3.eth.getTransactionReceipt(proxyfee.transfer(acc(1), 100, {from: acc(), gasPrice: gasPrice}));
var transferShortage1 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log("Gas used for transfer 1: " + transfer1.gasUsed + " Shortage: " + transferShortage1);
var exactFee = web3.toBigNumber(transfer1.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(transfer1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).add(100).add(actualFee).eq(tokenBalance));

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc()).toNumber();
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transfer.estimateGas(acc(1), 100, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
var transfer2 = web3.eth.getTransactionReceipt(proxyfee.transfer(acc(1), 100, {from: acc(), gasPrice: gasPrice}));
var transferShortage2 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferShortage1 == transferShortage2);
console.log("Gas used for transfer 2: " + transfer2.gasUsed + " Shortage: " + transferShortage2);
var exactFee = web3.toBigNumber(transfer2.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(transfer2.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).add(100).add(actualFee).eq(tokenBalance));

proxyfee.setOperationsCallGas(
  proxyfee.transferCallGas.call().add(transferShortage1),
  proxyfee.transferFromCallGas.call(),
  proxyfee.transferWithReferenceCallGas.call(),
  proxyfee.transferFromWithReferenceCallGas.call(),
  proxyfee.approveCallGas.call(),
  {from: acc()}
);

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc()).toNumber();
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transfer.estimateGas(acc(1), 100, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
var transfer3 = web3.eth.getTransactionReceipt(proxyfee.transfer(acc(1), 100, {from: acc(), gasPrice: gasPrice}));
var transferShortage3 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferShortage3 == 0);
console.log("Gas used for transfer 3: " + transfer3.gasUsed + " Shortage: " + transferShortage3);
var exactFee = web3.toBigNumber(transfer3.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(transfer3.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).add(100).add(actualFee).eq(tokenBalance));




var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.approve.estimateGas(acc(1), 10000, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.approve.call(acc(1), 10000, {from: acc(), gasPrice: gasPrice}));
var approve1 = web3.eth.getTransactionReceipt(proxyfee.approve(acc(1), 10000, {from: acc(), gasPrice: gasPrice}));
var approveShortage1 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log("Gas used for approve 1: " + approve1.gasUsed + " Shortage: " + approveShortage1);
var exactFee = web3.toBigNumber(approve1.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(approve1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).add(actualFee).eq(tokenBalance));

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.approve.estimateGas(acc(1), 10000, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.approve.call(acc(1), 10000, {from: acc(), gasPrice: gasPrice}));
var approve2 = web3.eth.getTransactionReceipt(proxyfee.approve(acc(1), 10000, {from: acc(), gasPrice: gasPrice}));
var approveShortage2 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(approveShortage1 == approveShortage2);
console.log("Gas used for approve 1: " + approve2.gasUsed + " Shortage: " + approveShortage2);
var exactFee = web3.toBigNumber(approve2.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(approve2.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).add(actualFee).eq(tokenBalance));

proxyfee.setOperationsCallGas(
  proxyfee.transferCallGas.call(),
  proxyfee.transferFromCallGas.call(),
  proxyfee.transferWithReferenceCallGas.call(),
  proxyfee.transferFromWithReferenceCallGas.call(),
  proxyfee.approveCallGas.call().add(approveShortage1),
  {from: acc()}
);

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.approve.estimateGas(acc(1), 10000, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.approve.call(acc(1), 10000, {from: acc(), gasPrice: gasPrice}));
var approve3 = web3.eth.getTransactionReceipt(proxyfee.approve(acc(1), 10000, {from: acc(), gasPrice: gasPrice}));
var approveShortage3 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(approveShortage3 == 0);
console.log("Gas used for approve 1: " + approve3.gasUsed + " Shortage: " + approveShortage3);
var exactFee = web3.toBigNumber(approve3.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(approve3.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).add(actualFee).eq(tokenBalance));



var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFrom.estimateGas(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFrom.call(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice}));
var transferFrom1 = web3.eth.getTransactionReceipt(proxyfee.transferFrom(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice}));
var transferFromShortage1 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log("Gas used for transferFrom 1: " + transferFrom1.gasUsed + " Shortage: " + transferFromShortage1);
var exactFee = web3.toBigNumber(transferFrom1.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(transferFrom1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(100)));
console.log(proxyfee.balanceOf.call(acc()).add(100).add(actualFee).eq(tokenBalanceFrom));

var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFrom.estimateGas(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFrom.call(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice}));
var transferFrom2 = web3.eth.getTransactionReceipt(proxyfee.transferFrom(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice}));
var transferFromShortage2 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromShortage1 == transferFromShortage2);
console.log("Gas used for transferFrom 2: " + transferFrom2.gasUsed + " Shortage: " + transferFromShortage2);
var exactFee = web3.toBigNumber(transferFrom2.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(transferFrom2.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(100)));
console.log(proxyfee.balanceOf.call(acc()).add(100).add(actualFee).eq(tokenBalanceFrom));

proxyfee.setOperationsCallGas(
  proxyfee.transferCallGas.call(),
  proxyfee.transferFromCallGas.call().add(transferFromShortage1),
  proxyfee.transferWithReferenceCallGas.call(),
  proxyfee.transferFromWithReferenceCallGas.call(),
  proxyfee.approveCallGas.call(),
  {from: acc()}
);

var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFrom.estimateGas(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFrom.call(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice}));
var transferFrom3 = web3.eth.getTransactionReceipt(proxyfee.transferFrom(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice}));
var transferFromShortage3 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromShortage3 == 0);
console.log("Gas used for transferFrom 3: " + transferFrom3.gasUsed + " Shortage: " + transferFromShortage3);
var exactFee = web3.toBigNumber(transferFrom3.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(transferFrom3.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(100)));
console.log(proxyfee.balanceOf.call(acc()).add(100).add(actualFee).eq(tokenBalanceFrom));




var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transferWithReference.estimateGas(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferWithReference.call(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReference1 = web3.eth.getTransactionReceipt(proxyfee.transferWithReference(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReferenceShortage1 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log("Gas used for transferWithReference 1: " + transferWithReference1.gasUsed + " Shortage: " + transferWithReferenceShortage1);
var exactFee = web3.toBigNumber(transferWithReference1.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(transferWithReference1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).eq(tokenBalance.sub(actualFee).sub(100)));

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transferWithReference.estimateGas(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferWithReference.call(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReference2 = web3.eth.getTransactionReceipt(proxyfee.transferWithReference(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReferenceShortage2 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferWithReferenceShortage1 == transferWithReferenceShortage2);
console.log("Gas used for transferWithReference 2: " + transferWithReference2.gasUsed + " Shortage: " + transferWithReferenceShortage2);
var exactFee = web3.toBigNumber(transferWithReference2.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(transferWithReference2.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).eq(tokenBalance.sub(actualFee).sub(100)));

proxyfee.setOperationsCallGas(
  proxyfee.transferCallGas.call(),
  proxyfee.transferFromCallGas.call(),
  proxyfee.transferWithReferenceCallGas.call().add(transferWithReferenceShortage1),
  proxyfee.transferFromWithReferenceCallGas.call(),
  proxyfee.approveCallGas.call(),
  {from: acc()}
);

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transferWithReference.estimateGas(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferWithReference.call(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReference3 = web3.eth.getTransactionReceipt(proxyfee.transferWithReference(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReferenceShortage3 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferWithReferenceShortage3 == 0);
console.log("Gas used for transferWithReference 3: " + transferWithReference3.gasUsed + " Shortage: " + transferWithReferenceShortage3);
var exactFee = web3.toBigNumber(transferWithReference3.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(transferWithReference3.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).eq(tokenBalance.sub(actualFee).sub(100)));

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transferWithReference.estimateGas(acc(1), 100, "The invoice #123332", {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferWithReference.call(acc(1), 100, "The invoice #123332", {from: acc(), gasPrice: gasPrice}));
var transferWithReference4 = web3.eth.getTransactionReceipt(proxyfee.transferWithReference(acc(1), 100, "The invoice #123332", {from: acc(), gasPrice: gasPrice}));
var transferWithReferenceShortage4 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferWithReferenceShortage4 <= 0);
console.log("Gas used for transferWithReference 3: " + transferWithReference4.gasUsed + " Shortage: " + transferWithReferenceShortage4);
var exactFee = web3.toBigNumber(transferWithReference4.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(transferWithReference4.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).eq(tokenBalance.sub(actualFee).sub(100)));





var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFromWithReference.estimateGas(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFromWithReference.call(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReference1 = web3.eth.getTransactionReceipt(proxyfee.transferFromWithReference(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReferenceShortage1 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log("Gas used for transferFromWithReference 1: " + transferFromWithReference1.gasUsed + " Shortage: " + transferFromWithReferenceShortage1);
var exactFee = web3.toBigNumber(transferFromWithReference1.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(transferFromWithReference1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(100)));
console.log(proxyfee.balanceOf.call(acc()).add(100).add(actualFee).eq(tokenBalanceFrom));

var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFromWithReference.estimateGas(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFromWithReference.call(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReference2 = web3.eth.getTransactionReceipt(proxyfee.transferFromWithReference(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReferenceShortage2 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromWithReferenceShortage1 == transferFromWithReferenceShortage2);
console.log("Gas used for transferFromWithReference 2: " + transferFromWithReference2.gasUsed + " Shortage: " + transferFromWithReferenceShortage2);
var exactFee = web3.toBigNumber(transferFromWithReference2.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(transferFromWithReference2.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(100)));
console.log(proxyfee.balanceOf.call(acc()).add(100).add(actualFee).eq(tokenBalanceFrom));

proxyfee.setOperationsCallGas(
  proxyfee.transferCallGas.call(),
  proxyfee.transferFromCallGas.call(),
  proxyfee.transferWithReferenceCallGas.call(),
  proxyfee.transferFromWithReferenceCallGas.call().add(transferFromWithReferenceShortage1),
  proxyfee.approveCallGas.call(),
  {from: acc()}
);

var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFromWithReference.estimateGas(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFromWithReference.call(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReference3 = web3.eth.getTransactionReceipt(proxyfee.transferFromWithReference(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReferenceShortage3 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromWithReferenceShortage3 == 0);
console.log("Gas used for transferFromWithReference 3: " + transferFromWithReference3.gasUsed + " Shortage: " + transferFromWithReferenceShortage3);
var exactFee = web3.toBigNumber(transferFromWithReference3.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(transferFromWithReference3.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(100)));
console.log(proxyfee.balanceOf.call(acc()).add(100).add(actualFee).eq(tokenBalanceFrom));

var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFromWithReference.estimateGas(acc(), acc(1), 100, "The invoice #123332", {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWei.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFromWithReference.call(acc(), acc(1), 100, "The invoice #123332", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReference4 = web3.eth.getTransactionReceipt(proxyfee.transferFromWithReference(acc(), acc(1), 100, "The invoice #123332", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReferenceShortage4 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromWithReferenceShortage4 <= 0);
console.log("Gas used for transferFromWithReference 3: " + transferFromWithReference4.gasUsed + " Shortage: " + transferFromWithReferenceShortage4);
var exactFee = web3.toBigNumber(transferFromWithReference4.logs[4].data.substr(0, 66)).div(proxyfee.tokenPriceInWei.call());
var actualFee = web3.toBigNumber(transferFromWithReference4.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(100)));
console.log(proxyfee.balanceOf.call(acc()).add(100).add(actualFee).eq(tokenBalanceFrom));