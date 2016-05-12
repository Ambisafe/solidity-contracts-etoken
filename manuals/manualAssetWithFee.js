var TestHelper = new (function() {
  // Convert number to 32 bytes hex representation.
  this.bytes32 = function(stringOrNumber) {
    var zeros = '000000000000000000000000000000000000000000000000000000000000000';
    if (typeof stringOrNumber === "string") {
      return (web3.toHex(stringOrNumber) + zeros).substr(0, 66);
    }
    var hexNumber = stringOrNumber.toString(16);
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

var now = function() {
  return Math.round(Date.now()/1000);
};

var dayStartNow = function() {
  return (now() - now() % 86400);
};

var gasPrice = web3.toBigNumber(web3.toWei(20, 'gwei'));

var acc = function(num) { return web3.eth.accounts[num || 0]; };

//var _proxyfeeSetup = web3.eth.contract(assetwithfeeContract.abi).at("");
var proxyfee = web3.eth.contract(assetwithfeeContract.abi).at("");

var ambi = web3.eth.contract(ambiContract.abi).at("");

var treasury = web3.eth.contract(ethertreasurynanoContract.abi).at("");

var etok = web3.eth.contract(multiassetContract.abi).at("");

var cosigner = web3.eth.contract(cosignerContract.abi).at("");

contract.transfer.estimateGas(addressTo, transferAmount, {from: userAddress, gasPrice: gasPrice}, function(_, result) {
  var txPrice = web3.toBigNumber(result).mul(gasPrice);
  contract.tokenPriceInWeiSell.call(function(_, result) {
    var correctEstimateFee = txPrice.div(result).ceil();
  });
})

ambi.addNode("dev", acc(), {from: acc()});
console.log(ambi.getNodeAddress.call("dev").valueOf() == acc());

//var symbol = "WEI";
//console.log(treasury.init.call(etok.address, symbol, {from: acc()}));
//treasury.init(etok.address, symbol, {from: acc()});
treasury.setAmbiAddress(ambi.address, "billable", {from: acc()});
console.log(ambi.getNodeAddress.call("billable").valueOf() == treasury.address);
ambi.setRelation("billable", "admin", "dev", {from: acc()});
console.log(ambi.isRelation.call("billable", "admin", "dev"));

console.log(treasury.deposit.call(acc(), {value: web3.toWei(1, 'ether'), from: acc()}));
treasury.deposit(acc(), {value: web3.toWei(1, 'ether'), from: acc()});
//console.log(treasury.balanceOf(acc()).valueOf());
console.log(web3.eth.getBalance(treasury.address).valueOf());
console.log(treasury.addAddress.call(acc(), {from: acc()}));
treasury.addAddress(acc(), {from: acc()});
console.log(treasury.withdraw.call(acc(5), gasPrice * 90000, {from: acc()}));
console.log(web3.eth.getTransactionReceipt(treasury.withdraw(acc(5), gasPrice * 90000, {from: acc()})).gasUsed);
//console.log(web3.eth.getTransactionReceipt(treasury.withdraw(acc(5), gasPrice * 90000, {from: acc()})).gasUsed);
console.log(treasury.addAddress.call(proxyfee.address, {from: acc()}));
treasury.addAddress(proxyfee.address, {from: acc()});
console.log(treasury.withdraw.call(acc(5), gasPrice * 90000, {from: proxyfee.address}));


// BILLABLE
console.log(treasury.subscribe.call(proxyfee.address, "sub_8MINIMh8z3OlAD", {from: acc()}));
treasury.subscribe(proxyfee.address, "sub_8MINIMh8z3OlAD", {from: acc()});
treasury.unFreeze("sub_8MINIMh8z3OlAD", {from: acc()});
console.log(treasury.withdraw.call(acc(5), gasPrice * 90000, {from: proxyfee.address}));

var symbol = "EVA";
etok.issueAsset(symbol, 10000000, "test", "descr", 2, false, {from: acc()});
console.log(etok.balanceOf.call(acc(), symbol).toNumber() == 10000000);
etok.setProxy(proxyfee.address, true, symbol, {from: acc()});
console.log(etok.setEventsProxy.call(proxyfee.address, symbol, {from: acc()}));
etok.setEventsProxy(proxyfee.address, symbol, {from: acc()});

proxyfee.init(etok.address, symbol, {from: acc()});
console.log(proxyfee.balanceOf.call(acc()).toNumber() == 10000000);

proxyfee.setAmbiAddress(ambi.address, symbol, {from: acc()});
console.log(ambi.getNodeAddress.call(symbol).valueOf() == proxyfee.address);
ambi.setRelation(symbol, "admin", "dev", {from: acc()});
console.log(ambi.isRelation.call(symbol, "admin", "dev"));
ambi.setRelation(symbol, "setup", "dev", {from: acc()});
console.log(ambi.isRelation.call(symbol, "setup", "dev"));
ambi.setRelation(symbol, "cron", "dev", {from: acc()});
console.log(ambi.isRelation.call(symbol, "cron", "dev"));
ambi.setRelation(symbol, "fee", "dev", {from: acc()});
console.log(ambi.isRelation.call(symbol, "fee", "dev"));
//ambi.addNode("proxyfee", proxyfee.address, {from: acc()});
//ambi.getNodeAddress.call("proxyfee").valueOf() == proxyfee.address;
//ambi.setRelation("treasury", "refunder", "proxyfee", {from: acc()}); // Will change!
//ambi.isRelation.call("treasury", "refunder", "proxyfee");

//!treasury.isActiveClient.call(1);
var balanceBefore = web3.eth.getBalance(treasury.address);
treasury.deposit(proxyfee.address, {from: acc(), value: web3.toWei(10, 'ether')});
console.log(web3.eth.getBalance(treasury.address).eq(balanceBefore.add(web3.toWei(10, 'ether'))));
//treasury.isActiveClient.call(1).valueOf();

//ambi.setRelation("treasury", sha3("client", bytes32(1)), "proxyfee", {from: acc()}); // Might change!
//ambi.isRelation.call("treasury", sha3("client", bytes32(1)), "proxyfee").valueOf()

console.log(web3.eth.getBalance(proxyfee.address).toNumber() == 0);
console.log(treasury.withdraw.call(proxyfee.address, 1, {from: proxyfee.address}));

var feeAddress = acc(3);
var exchangeAddress = acc(7);
var cosignerAddress = cosigner.address;

console.log(proxyfee.setForward.call(cosigner.confirm.getData().substr(0,10), cosignerAddress, {from: acc()}));
proxyfee.setForward(cosigner.confirm.getData().substr(0,10), cosignerAddress, {from: acc()});

//console.log("1 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferCallGas(acc(1), 1000, {from: acc()})).gasUsed);
//console.log("2 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferFromCallGas(acc(1), acc(2), 1000, {from: acc()})).gasUsed);
//console.log("3 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferWithReferenceCallGas(acc(1), 1000, "a", {from: acc()})).gasUsed);
//console.log("4 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferFromWithReferenceCallGas(acc(1), acc(2), 1000, "a", {from: acc()})).gasUsed);
//console.log("5 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getApproveCallGas(acc(1), 1000, {from: acc()})).gasUsed);
//console.log("6 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getForwardCallGas(cosignerAddress, "o", {from: acc()})).gasUsed);

//proxyfee.setOperationsCallGas(
//  web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferCallGas(acc(1), 1000, {from: acc()})).gasUsed,
//  web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferFromCallGas(acc(1), acc(2), 1000, {from: acc()})).gasUsed,
//  web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferWithReferenceCallGas(acc(1), 1000, "a", {from: acc()})).gasUsed,
//  web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferFromWithReferenceCallGas(acc(1), acc(2), 1000, "a", {from: acc()})).gasUsed,
//  web3.eth.getTransactionReceipt(_proxyfeeSetup.getApproveCallGas(acc(1), 1000, {from: acc()})).gasUsed,
//  web3.eth.getTransactionReceipt(_proxyfeeSetup.getForwardCallGas(cosignerAddress, "o", {from: acc()})).gasUsed,
//  {from: acc()}
//);

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
console.log(proxyfee.forwardCallGas.call().toNumber() > 24000);
console.log(proxyfee.forwardCallGas.call().toNumber() < 25000);

proxyfee.setWholeTokenPrice(web3.toWei(0.01, 'ether'), web3.toWei(0.02, 'ether'), {from: acc()});
console.log(proxyfee.tokenPriceInWeiSell.call().eq(web3.toBigNumber(web3.toWei(0.01, 'ether')).div(100)));
console.log(proxyfee.tokenPriceInWeiBuy.call().eq(web3.toBigNumber(web3.toWei(0.02, 'ether')).div(100)));
console.log(proxyfee.setupTreasury.call(treasury.address, {from: acc()}));
proxyfee.setupTreasury(treasury.address, {from: acc()});
console.log(proxyfee.setupFee.call(feeAddress, {from: acc()}));

proxyfee.approve(proxyfee.address, 1000000, {from: acc()});
console.log(proxyfee.allowance(acc(), proxyfee.address).valueOf());

proxyfee.setupFee(feeAddress, {from: acc()});
console.log(proxyfee.updateFeeGas.call({from: acc()}).valueOf());
console.log(proxyfee.updateFeeGas.call({from: acc()}).toNumber() > 0);
proxyfee.updateFeeGas({from: acc()});
console.log(proxyfee.updateFeeGas.call({from: acc()}).valueOf());
console.log(proxyfee.updateFeeGas.call({from: acc()}).toNumber() > 0);
proxyfee.updateFeeGas({from: acc()});
console.log(proxyfee.feeGas.call({from: acc()}).valueOf());
console.log(proxyfee.feeGas.call({from: acc()}).toNumber() < 39000);
console.log(proxyfee.updateRefundGas.call({from: acc()}).toNumber() > 0);
proxyfee.updateRefundGas({from: acc()});
console.log(proxyfee.refundGas.call({from: acc()}).valueOf());
console.log(proxyfee.refundGas.call({from: acc()}).toNumber() < 12000); // 8000 for pure nano

console.log(proxyfee.setupExchange.call(exchangeAddress, 1, 2000, 500, 3000, {from: acc()}));
proxyfee.setupExchange(exchangeAddress, 1, 2000, 500, 3000, {from: acc()});
console.log(proxyfee.buyLimitMin.call().toNumber() == 1);
console.log(proxyfee.buyLimitMax.call().toNumber() == 2000);
console.log(proxyfee.sellLimitMin.call().toNumber() == 500);
console.log(proxyfee.sellLimitMax.call().toNumber() == 3000);

var transferAmount = 65793; // 3 non zero bytes

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transfer.estimateGas(acc(1), transferAmount, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transfer.call(acc(1), transferAmount, {from: acc(), gasPrice: gasPrice}));
var transfer1 = web3.eth.getTransactionReceipt(proxyfee.transfer(acc(1), transferAmount, {from: acc(), gasPrice: gasPrice}));
var transferShortage1 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log("Gas used for transfer 1: " + transfer1.gasUsed + " Shortage: " + transferShortage1);
var exactFee = web3.toBigNumber(transfer1.gasUsed - transferShortage1).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transfer1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).add(transferAmount).add(actualFee).eq(tokenBalance));

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc()).toNumber();
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transfer.estimateGas(acc(1), transferAmount, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
var transfer2 = web3.eth.getTransactionReceipt(proxyfee.transfer(acc(1), transferAmount, {from: acc(), gasPrice: gasPrice}));
var transferShortage2 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferShortage1 == transferShortage2);
console.log("Gas used for transfer 2: " + transfer2.gasUsed + " Shortage: " + transferShortage2);
var exactFee = web3.toBigNumber(transfer2.gasUsed - transferShortage2).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transfer2.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).add(transferAmount).add(actualFee).eq(tokenBalance));

proxyfee.setOperationsCallGas(
  proxyfee.transferCallGas.call().add(transferShortage1),
  proxyfee.transferFromCallGas.call(),
  proxyfee.transferWithReferenceCallGas.call(),
  proxyfee.transferFromWithReferenceCallGas.call(),
  proxyfee.approveCallGas.call(),
  proxyfee.forwardCallGas.call(),
  proxyfee.setCosignerCallGas.call(),
  {from: acc()}
);

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc()).toNumber();
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transfer.estimateGas(acc(1), transferAmount, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
var transfer3 = web3.eth.getTransactionReceipt(proxyfee.transfer(acc(1), transferAmount, {from: acc(), gasPrice: gasPrice}));
var transferShortage3 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferShortage3 == 0);
console.log("Gas used for transfer 3: " + transfer3.gasUsed + " Shortage: " + transferShortage3);
var exactFee = web3.toBigNumber(transfer3.gasUsed - transferShortage3).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transfer3.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).add(transferAmount).add(actualFee).eq(tokenBalance));




var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.approve.estimateGas(acc(1), 10000, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.approve.call(acc(1), 10000, {from: acc(), gasPrice: gasPrice}));
var approve1 = web3.eth.getTransactionReceipt(proxyfee.approve(acc(1), 10000, {from: acc(), gasPrice: gasPrice}));
var approveShortage1 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log("Gas used for approve 1: " + approve1.gasUsed + " Shortage: " + approveShortage1);
var exactFee = web3.toBigNumber(approve1.gasUsed - approveShortage1).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(approve1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).add(actualFee).eq(tokenBalance));

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.approve.estimateGas(acc(1), 10000, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.approve.call(acc(1), 10000, {from: acc(), gasPrice: gasPrice}));
var approve2 = web3.eth.getTransactionReceipt(proxyfee.approve(acc(1), 10000, {from: acc(), gasPrice: gasPrice}));
var approveShortage2 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(approveShortage1 == approveShortage2);
console.log("Gas used for approve 1: " + approve2.gasUsed + " Shortage: " + approveShortage2);
var exactFee = web3.toBigNumber(approve2.gasUsed - approveShortage2).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
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
  proxyfee.forwardCallGas.call(),
  proxyfee.setCosignerCallGas.call(),
  {from: acc()}
);

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.approve.estimateGas(acc(1), 10000, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.approve.call(acc(1), 10000, {from: acc(), gasPrice: gasPrice}));
var approve3 = web3.eth.getTransactionReceipt(proxyfee.approve(acc(1), 10000, {from: acc(), gasPrice: gasPrice}));
var approveShortage3 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(approveShortage3 == 0);
console.log("Gas used for approve 1: " + approve3.gasUsed + " Shortage: " + approveShortage3);
var exactFee = web3.toBigNumber(approve3.gasUsed - approveShortage3).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
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
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFrom.estimateGas(acc(), acc(1), transferAmount, {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFrom.call(acc(), acc(1), transferAmount, {from: acc(1), gasPrice: gasPrice}));
var transferFrom1 = web3.eth.getTransactionReceipt(proxyfee.transferFrom(acc(), acc(1), transferAmount, {from: acc(1), gasPrice: gasPrice}));
var transferFromShortage1 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log("Gas used for transferFrom 1: " + transferFrom1.gasUsed + " Shortage: " + transferFromShortage1);
var exactFee = web3.toBigNumber(transferFrom1.gasUsed - transferFromShortage1).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferFrom1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(transferAmount)));
console.log(proxyfee.balanceOf.call(acc()).add(transferAmount).add(actualFee).eq(tokenBalanceFrom));

var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFrom.estimateGas(acc(), acc(1), transferAmount, {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFrom.call(acc(), acc(1), transferAmount, {from: acc(1), gasPrice: gasPrice}));
var transferFrom2 = web3.eth.getTransactionReceipt(proxyfee.transferFrom(acc(), acc(1), transferAmount, {from: acc(1), gasPrice: gasPrice}));
var transferFromShortage2 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromShortage1 == transferFromShortage2);
console.log("Gas used for transferFrom 2: " + transferFrom2.gasUsed + " Shortage: " + transferFromShortage2);
var exactFee = web3.toBigNumber(transferFrom2.gasUsed - transferFromShortage2).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferFrom2.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(transferAmount)));
console.log(proxyfee.balanceOf.call(acc()).add(transferAmount).add(actualFee).eq(tokenBalanceFrom));

proxyfee.setOperationsCallGas(
  proxyfee.transferCallGas.call(),
  proxyfee.transferFromCallGas.call().add(transferFromShortage1),
  proxyfee.transferWithReferenceCallGas.call(),
  proxyfee.transferFromWithReferenceCallGas.call(),
  proxyfee.approveCallGas.call(),
  proxyfee.forwardCallGas.call(),
  proxyfee.setCosignerCallGas.call(),
  {from: acc()}
);

var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFrom.estimateGas(acc(), acc(1), transferAmount, {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFrom.call(acc(), acc(1), transferAmount, {from: acc(1), gasPrice: gasPrice}));
var transferFrom3 = web3.eth.getTransactionReceipt(proxyfee.transferFrom(acc(), acc(1), transferAmount, {from: acc(1), gasPrice: gasPrice}));
var transferFromShortage3 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromShortage3 == 0);
console.log("Gas used for transferFrom 3: " + transferFrom3.gasUsed + " Shortage: " + transferFromShortage3);
var exactFee = web3.toBigNumber(transferFrom3.gasUsed - transferFromShortage3).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferFrom3.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(transferAmount)));
console.log(proxyfee.balanceOf.call(acc()).add(transferAmount).add(actualFee).eq(tokenBalanceFrom));




var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transferWithReference.estimateGas(acc(1), transferAmount, "a", {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferWithReference.call(acc(1), transferAmount, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReference1 = web3.eth.getTransactionReceipt(proxyfee.transferWithReference(acc(1), transferAmount, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReferenceShortage1 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log("Gas used for transferWithReference 1: " + transferWithReference1.gasUsed + " Shortage: " + transferWithReferenceShortage1);
var exactFee = web3.toBigNumber(transferWithReference1.gasUsed - transferWithReferenceShortage1).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferWithReference1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).eq(tokenBalance.sub(actualFee).sub(transferAmount)));

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transferWithReference.estimateGas(acc(1), transferAmount, "a", {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferWithReference.call(acc(1), transferAmount, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReference2 = web3.eth.getTransactionReceipt(proxyfee.transferWithReference(acc(1), transferAmount, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReferenceShortage2 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferWithReferenceShortage1 == transferWithReferenceShortage2);
console.log("Gas used for transferWithReference 2: " + transferWithReference2.gasUsed + " Shortage: " + transferWithReferenceShortage2);
var exactFee = web3.toBigNumber(transferWithReference2.gasUsed - transferWithReferenceShortage2).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferWithReference2.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).eq(tokenBalance.sub(actualFee).sub(transferAmount)));

proxyfee.setOperationsCallGas(
  proxyfee.transferCallGas.call(),
  proxyfee.transferFromCallGas.call(),
  proxyfee.transferWithReferenceCallGas.call().add(transferWithReferenceShortage1),
  proxyfee.transferFromWithReferenceCallGas.call(),
  proxyfee.approveCallGas.call(),
  proxyfee.forwardCallGas.call(),
  proxyfee.setCosignerCallGas.call(),
  {from: acc()}
);

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transferWithReference.estimateGas(acc(1), transferAmount, "a", {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferWithReference.call(acc(1), transferAmount, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReference3 = web3.eth.getTransactionReceipt(proxyfee.transferWithReference(acc(1), transferAmount, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReferenceShortage3 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferWithReferenceShortage3 == 0);
console.log("Gas used for transferWithReference 3: " + transferWithReference3.gasUsed + " Shortage: " + transferWithReferenceShortage3);
var exactFee = web3.toBigNumber(transferWithReference3.gasUsed - transferWithReferenceShortage3).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferWithReference3.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).eq(tokenBalance.sub(actualFee).sub(transferAmount)));

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transferWithReference.estimateGas(acc(1), transferAmount, "The invoice #123332", {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferWithReference.call(acc(1), transferAmount, "The invoice #123332", {from: acc(), gasPrice: gasPrice}));
var transferWithReference4 = web3.eth.getTransactionReceipt(proxyfee.transferWithReference(acc(1), transferAmount, "The invoice #123332", {from: acc(), gasPrice: gasPrice}));
var transferWithReferenceShortage4 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferWithReferenceShortage4 <= 0);
console.log("Gas used for transferWithReference 3: " + transferWithReference4.gasUsed + " Shortage: " + transferWithReferenceShortage4);
var exactFee = web3.toBigNumber(transferWithReference4.gasUsed - transferWithReferenceShortage4).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferWithReference4.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).eq(tokenBalance.sub(actualFee).sub(transferAmount)));





var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFromWithReference.estimateGas(acc(), acc(1), transferAmount, "a", {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFromWithReference.call(acc(), acc(1), transferAmount, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReference1 = web3.eth.getTransactionReceipt(proxyfee.transferFromWithReference(acc(), acc(1), transferAmount, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReferenceShortage1 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log("Gas used for transferFromWithReference 1: " + transferFromWithReference1.gasUsed + " Shortage: " + transferFromWithReferenceShortage1);
var exactFee = web3.toBigNumber(transferFromWithReference1.gasUsed - transferFromWithReferenceShortage1).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferFromWithReference1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(transferAmount)));
console.log(proxyfee.balanceOf.call(acc()).add(transferAmount).add(actualFee).eq(tokenBalanceFrom));

var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFromWithReference.estimateGas(acc(), acc(1), transferAmount, "a", {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFromWithReference.call(acc(), acc(1), transferAmount, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReference2 = web3.eth.getTransactionReceipt(proxyfee.transferFromWithReference(acc(), acc(1), transferAmount, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReferenceShortage2 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromWithReferenceShortage1 == transferFromWithReferenceShortage2);
console.log("Gas used for transferFromWithReference 2: " + transferFromWithReference2.gasUsed + " Shortage: " + transferFromWithReferenceShortage2);
var exactFee = web3.toBigNumber(transferFromWithReference2.gasUsed - transferFromWithReferenceShortage2).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferFromWithReference2.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(transferAmount)));
console.log(proxyfee.balanceOf.call(acc()).add(transferAmount).add(actualFee).eq(tokenBalanceFrom));

proxyfee.setOperationsCallGas(
  proxyfee.transferCallGas.call(),
  proxyfee.transferFromCallGas.call(),
  proxyfee.transferWithReferenceCallGas.call(),
  proxyfee.transferFromWithReferenceCallGas.call().add(transferFromWithReferenceShortage1),
  proxyfee.approveCallGas.call(),
  proxyfee.forwardCallGas.call(),
  proxyfee.setCosignerCallGas.call(),
  {from: acc()}
);

var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFromWithReference.estimateGas(acc(), acc(1), transferAmount, "a", {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFromWithReference.call(acc(), acc(1), transferAmount, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReference3 = web3.eth.getTransactionReceipt(proxyfee.transferFromWithReference(acc(), acc(1), transferAmount, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReferenceShortage3 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromWithReferenceShortage3 == 0);
console.log("Gas used for transferFromWithReference 3: " + transferFromWithReference3.gasUsed + " Shortage: " + transferFromWithReferenceShortage3);
var exactFee = web3.toBigNumber(transferFromWithReference3.gasUsed - transferFromWithReferenceShortage3).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferFromWithReference3.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(transferAmount)));
console.log(proxyfee.balanceOf.call(acc()).add(transferAmount).add(actualFee).eq(tokenBalanceFrom));

var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFromWithReference.estimateGas(acc(), acc(1), transferAmount, "The invoice #123332", {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFromWithReference.call(acc(), acc(1), transferAmount, "The invoice #123332", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReference4 = web3.eth.getTransactionReceipt(proxyfee.transferFromWithReference(acc(), acc(1), transferAmount, "The invoice #123332", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReferenceShortage4 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromWithReferenceShortage4 <= 0);
console.log("Gas used for transferFromWithReference 3: " + transferFromWithReference4.gasUsed + " Shortage: " + transferFromWithReferenceShortage4);
var exactFee = web3.toBigNumber(transferFromWithReference4.gasUsed - transferFromWithReferenceShortage4).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferFromWithReference4.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(transferAmount)));
console.log(proxyfee.balanceOf.call(acc()).add(transferAmount).add(actualFee).eq(tokenBalanceFrom));


var amount = 1000;
console.log(etok.approve.call(proxyfee.address, amount, symbol, {from: acc(), gasPrice: gasPrice}));
etok.approve(proxyfee.address, amount, symbol, {from: acc(), gasPrice: gasPrice});
var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var exchangeBalance = proxyfee.balanceOf(exchangeAddress);
var treasuryBalance = web3.eth.getBalance(treasury.address);
var correctEstimateResult = proxyfee.tokenPriceInWeiSell.call().mul(amount).ceil();
console.log(proxyfee.sell.call(acc(), amount, {from: acc(), gasPrice: gasPrice}));
var sell1 = web3.eth.getTransactionReceipt(proxyfee.sell(acc(), amount, {from: acc(), gasPrice: gasPrice}));
console.log("Gas used for sell 1: " + sell1.gasUsed);
var actualResult = web3.toBigNumber(sell1.logs[2].data.substr(0, 66));
console.log(correctEstimateResult.eq(actualResult));
console.log("Estimate: " + correctEstimateResult.valueOf() + " actual: " + actualResult.toNumber());
console.log(proxyfee.balanceOf.call(exchangeAddress).eq(exchangeBalance.add(amount)));
console.log(proxyfee.balanceOf.call(acc()).eq(tokenBalance.sub(amount)));
console.log(web3.eth.getBalance(acc()).eq(balance.add(actualResult).sub(gasPrice.mul(sell1.gasUsed))));
console.log(web3.eth.getBalance(treasury.address).eq(treasuryBalance.sub(actualResult)));
console.log(proxyfee.allowance.call(acc(), proxyfee.address).eq(0));



console.log(etok.approve.call(proxyfee.address, 1000000, symbol, {from: exchangeAddress, gasPrice: gasPrice}));
etok.approve(proxyfee.address, 1000000, symbol, {from: exchangeAddress, gasPrice: gasPrice});

var amount = 1000;
var price = proxyfee.tokenPriceInWeiBuy.call().mul(amount);
var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var exchangeTokenBalance = proxyfee.balanceOf(exchangeAddress);
var exchangeBalance = web3.eth.getBalance(exchangeAddress);
var treasuryBalance = web3.eth.getBalance(treasury.address);
console.log(proxyfee.buy.call(acc(), {from: acc(), gasPrice: gasPrice, value: price}));
var buy1 = web3.eth.getTransactionReceipt(proxyfee.buy(acc(), {from: acc(), gasPrice: gasPrice, value: price}));
console.log("Gas used for buy 1: " + buy1.gasUsed);
var actualResult = web3.toBigNumber(buy1.logs[buy1.logs.length-1].data.substr(0, 66));
console.log(actualResult.eq(amount));
console.log("Estimate: " + amount + " actual: " + actualResult.toNumber());
console.log(proxyfee.balanceOf.call(exchangeAddress).eq(exchangeTokenBalance.sub(amount)));
console.log(proxyfee.balanceOf.call(acc()).eq(tokenBalance.add(amount)));
console.log(web3.eth.getBalance(acc()).eq(balance.sub(price).sub(gasPrice.mul(buy1.gasUsed))));
console.log(web3.eth.getBalance(treasury.address).eq(treasuryBalance));
console.log(web3.eth.getBalance(exchangeAddress).eq(exchangeAddress.add(price)));


console.log(cosigner.addOracle.call("0x28fCebB90035e25136D1887B6F0851D41281da20", {from: acc()}));
cosigner.addOracle("0x28fCebB90035e25136D1887B6F0851D41281da20", {from: acc()});
console.log(proxyfee.approve.call(proxyfee.address, 1000, {from: acc(1)}));
proxyfee.approve(proxyfee.address, 1000, {from: acc(1)});


console.log(etok.setCosignerAddress.call(cosigner.address, symbol, {from: acc(1)}));
etok.setCosignerAddress(cosigner.address, symbol, {from: acc(1)});
console.log(etok.getHolderId(acc(1)).toNumber() == 4);
console.log(etok.getCosignerAddress.call(sha3(bytes32(etok.getHolderId.call(acc(1)).toNumber()), bytes32(symbol))) == cosigner.address);

var operationData = etok.proxyTransfer.getData(acc(), 100, symbol, {from: acc(1), gasPrice: gasPrice});
var operationHash = sha3(operationData, bytes32(etok.getHolderId(acc(1)).toNumber()));
var confirmData = cosigner.confirm.getData(operationHash, acc(1), 1457348561432, 0x1f, "0xa05108dadc92acf18f83f016e57635f8e648a554cbc3bba6b3ef1d8b4eb289fa", "0x2f4967d53c8f6dc6aafd4b06debf4eae6db3d83a9a06197642c23fae1f95cbc7");
console.log(!cosigner.isConfirmed(operationHash));
var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(web3.eth.estimateGas({to: proxyfee.address, data: confirmData, from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
var forward1 = web3.eth.getTransactionReceipt(web3.eth.sendTransaction({to: proxyfee.address, data: confirmData, from: acc(1), gasPrice: gasPrice}));
console.log(cosigner.isConfirmed(operationHash));
var forwardShortage1 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log("Gas used for forward 1: " + forward1.gasUsed + " Shortage: " + forwardShortage1);
var exactFee = web3.toBigNumber(forward1.gasUsed - forwardShortage1).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(forward1.logs[2].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).add(actualFee).eq(tokenBalance));

if (forwardShortage1 > 0) {
  proxyfee.setOperationsCallGas(
    proxyfee.transferCallGas.call(),
    proxyfee.transferFromCallGas.call(),
    proxyfee.transferWithReferenceCallGas.call(),
    proxyfee.transferFromWithReferenceCallGas.call(),
    proxyfee.approveCallGas.call(),
    proxyfee.forwardCallGas.call().add(forwardShortage1),
    proxyfee.setCosignerCallGas.call(),
    {from: acc()}
  );
}

var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transfer.estimateGas(acc(), 100, {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transfer.call(acc(), 100, {from: acc(1), gasPrice: gasPrice}));
var transferWithCosigning1 = web3.eth.getTransactionReceipt(proxyfee.transfer(acc(), 100, {from: acc(1), gasPrice: gasPrice}));
var transferWithCosigningShortage1 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log("Gas used for transferWithCosigning 1: " + transferWithCosigning1.gasUsed + " Shortage: " + transferWithCosigningShortage1); // On testrpc shortage is huge here. Probably bug.
var exactFee = web3.toBigNumber(transferWithCosigning1.gasUsed - transferWithCosigningShortage1).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferWithCosigning1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).add(100).add(actualFee).eq(tokenBalance));


var da = "0x53786e5722f854a62783395dcdc27d633a9b063e"; // shared deployment address

// failed
//etokOD.setProxy("0xa4ec4a51aa00430a752eb37206d47263b5fc657a", true, "OD", {from: da, gas: 300000}, cb);
//etokOD.setEventsProxy("0xa4ec4a51aa00430a752eb37206d47263b5fc657a", "OD", {from: da, gas: 300000}, cb);
//od.init("0x0ec62107c77fcb3084e6bc8f95d4ba0d6418734f", "OD", {from: da, gas: 300000}, cb);
// failed
etokOD.issueAsset("ODi", 250000000000000, "OpenDollar", "OpenDollar official currency", 4, false, {from: da, gas: 300000}, cb);
etokOD.setProxy("0x78b0317183e55929dffde6dc43bf9113206cafae", true, "ODi", {from: da, gas: 300000}, cb);
etokOD.setEventsProxy("0x78b0317183e55929dffde6dc43bf9113206cafae", "ODi", {from: da, gas: 300000}, cb);
od.init("0x0ec62107c77fcb3084e6bc8f95d4ba0d6418734f", "ODi", {from: da, gas: 300000}, cb);

etokUAH.setProxy("0xdb35a698114677a64dc479a258856403c2a8b490", true, "UAH", {from: da, gas: 300000}, cb);
etokUAH.setEventsProxy("0xdb35a698114677a64dc479a258856403c2a8b490", "UAH", {from: da, gas: 300000}, cb);
uah.init("0x0ec62107c77fcb3084e6bc8f95d4ba0d6418734f", "UAH", {from: da, gas: 300000}, cb);

etokEVA.setProxy("0x1a0dbcf7d58edc7891ce956b27db4820ae65b14a", true, "EvaUSD", {from: da, gas: 300000}, cb);
etokEVA.setEventsProxy("0x1a0dbcf7d58edc7891ce956b27db4820ae65b14a", "EvaUSD", {from: da, gas: 300000}, cb);
evaUSD.init("0x0ec62107c77fcb3084e6bc8f95d4ba0d6418734f", "EvaUSD", {from: da, gas: 300000}, cb);

etokEVA.setProxy("0x95fbe517be87d42053788035059a9ee3af808238", true, "EvaEUR", {from: da, gas: 300000}, cb);
etokEVA.setEventsProxy("0x95fbe517be87d42053788035059a9ee3af808238", "EvaEUR", {from: da, gas: 300000}, cb);
evaEUR.init("0x0ec62107c77fcb3084e6bc8f95d4ba0d6418734f", "EvaEUR", {from: da, gas: 300000}, cb);

etokEVA.setProxy("0x348809661459afbb7f4371e252bb87199e9f1ac8", true, "EvaRUR", {from: da, gas: 300000}, cb);
etokEVA.setEventsProxy("0x348809661459afbb7f4371e252bb87199e9f1ac8", "EvaRUR", {from: da, gas: 300000}, cb);
evaRUR.init("0x0ec62107c77fcb3084e6bc8f95d4ba0d6418734f", "EvaRUR", {from: da, gas: 300000}, cb);

var nano1 = web3.eth.contract([{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"}],"name":"addAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"}],"name":"removeAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_ambi","type":"address"},{"name":"_name","type":"bytes32"}],"name":"setAmbiAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"hasAccess","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[],"name":"remove","outputs":[],"type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_reference","type":"string"}],"name":"withdrawWithReference","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"withdraw","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_reference","type":"string"}],"name":"depositWithReference","outputs":[{"name":"","type":"bool"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"reference","type":"string"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"reference","type":"string"}],"name":"Withdrawal","type":"event"}]);
nano1.new(
  {
    from: da, 
    data: '0x60606040526106c4806100126000396000f36060604052361561008d5760e060020a600035046306fdde03811461009a57806321f8a721146100a357806338eada1c1461011b5780634ba79dfe146101dc5780637948f5231461029957806395a078e8146102be578063a7f43779146102d9578063d0e30db014610300578063f359671c14610317578063f3fef3a31461036f578063f89005e7146103c1575b6104bc60006104ce610304565b6104bc60015481565b6104d460043560408051600080547f2ade6c360000000000000000000000000000000000000000000000000000000083526004830185905292519092600160a060020a031691632ade6c36916024808301926020929190829003018187876161da5a03f1156100025750506040515191506104b79050565b6104bc6004356000805460d960020a6430b236b4b70290600160a060020a031682148015906101aa575060408051835460015460e460020a630a1add5102835260048301526024820184905233600160a060020a039081166044840152925192169163a1add51091606480820192602092909190829003018188876161da5a03f1156100025750506040515190505b156104fa575050600160a060020a0381166000908152600260205260409020805460ff191660019081179091556104b7565b6104bc6004356000805460d960020a6430b236b4b70290600160a060020a0316821480159061026b575060408051835460015460e460020a630a1add5102835260048301526024820184905233600160a060020a039081166044840152925192169163a1add51091606480820192602092909190829003018188876161da5a03f1156100025750506040515190505b156104fa575050600160a060020a0381166000908152600260205260409020805460ff1916905560016104b7565b6104bc6004356024356000805481908190600160a060020a0316811461052f57610527565b6104bc60043560026020526000908152604090205460ff1681565b6104f0600054600160a060020a039081163390911614156105fe5733600160a060020a0316ff5b6104bc5b600060003411156104f2575060016104d1565b604080516020604435600481810135601f81018490048402850184019095528484526104bc94813594602480359593946064949293910191819084018382808284375094965050505050505060006106b68484610379565b6104bc6004356024355b33600160a060020a031660009081526002602052604081205460ff16156103bb57604051600160a060020a038416908290849082818181858883f19450505050505b92915050565b6040805160206004803580820135601f81018490048402850184019095528484526104bc949193602493909291840191908190840183828082843750949650505050505050600060003411156104b35733600160a060020a03167f643e927b32d5bfd08eccd2fcbd97057ad413850f857a2359639114e8e8dd3d7b348460405180838152602001806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600f02600301f150905090810190601f1680156104a45780820380516001836020036101000a031916815260200191505b50935050505060405180910390a25b5060015b919050565b60408051918252519081900360200190f35b90505b90565b60408051600160a060020a039092168252519081900360200190f35b005b5060006104d1565b50919050565b60018481556000805473ffffffffffffffffffffffffffffffffffffffff19168417905592505b505092915050565b84915030600160a060020a031682600160a060020a0316632ade6c36866040518260e060020a028152600401808281526020019150506020604051808303816000876161da5a03f11561000257505060405151600160a060020a031690911490506105005781600160a060020a0316637684937685306040518360e060020a0281526004018083815260200182600160a060020a03168152602001925050506020604051808303816000876161da5a03f115610002575050604051519150508015156105005760009250610527565b565b83600160a060020a031633600160a060020a03167f2b0d35cc55a37536a00cf056f44b5f4b453659ddd18bc131a978463523ad3a1f858560405180838152602001806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600f02600301f150905090810190601f16801561069d5780820380516001836020036101000a031916815260200191505b50935050505060405180910390a35060015b9392505050565b1515610600575060006106af56', 
    gas: 3000000
  }, function(e, contract){
    console.log(e, contract);
    if (typeof contract.address != 'undefined') {
      console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
      nano1 = nano1.at(contract.address);
    }
})


nano1.setAmbiAddress(ambiAddress, "treasuryEva", {from: da, gas: 300000}, cb);
ambiInt.setRelation("treasuryEva", "admin", "common", {from: da, gas: 300000}, cb);
nano1.addAddress(da, {from: da, gas: 300000}, cb);
nano1.addAddress(evaUSD.address, {from: da, gas: 300000}, cb);
nano1.addAddress(evaEUR.address, {from: da, gas: 300000}, cb);
nano1.addAddress(evaRUR.address, {from: da, gas: 300000}, cb);
nano1.depositWithReference("First", {from: da, value: web3.toWei(0.1, 'ether'), gas: 300000}, cb);


var feeAddress = "0x01ddbd112f334577d80406c84d08364ef09a5ed7";


evaUSD.setAmbiAddress(ambiInt.address, "evaUSD", {from: da, gas: 300000}, cb);
ambiInt.setRelation("evaUSD", "admin", "common", {from: da, gas: 300000}, cb);
ambiInt.setRelation("evaUSD", "setup", "common", {from: da, gas: 300000}, cb);
ambiInt.setRelation("evaUSD", "cron", "common", {from: da, gas: 300000}, cb);
ambiInt.setRelation("evaUSD", "fee", "common", {from: da, gas: 300000}, cb);
safeTransaction(etokint.approve, [evaUSD.address, 100000, "EvaUSD"], da);
safeTransaction(etokEVA.transfer, [da, 100, "EvaUSD"], da);
safeTransaction(evaUSD.setOperationsCallGas, ["23861", "24711", "24606", "25734", "23232", "24658"], da);
safeTransaction(evaUSD.setWholeTokenPrice, [web3.toWei(0.1, 'ether'), web3.toWei(0.11, 'ether')], da);
safeTransaction(evaUSD.setupTreasury, [nano1.address], da);
safeTransactions([
  safeTransactionFunction(evaUSD.setupFee, [feeAddress], da, {waitReceipt: true}),
  safeTransactionFunction(evaUSD.updateFeeGas, [], da, {waitReceipt: true}),
  safeTransactionFunction(evaUSD.updateFeeGas, [], da),
  safeTransactionFunction(evaUSD.updateRefundGas, [], da)
]);


safeTransaction(evaEUR.setAmbiAddress, [ambiInt.address, "evaEUR"], da);
safeTransaction(ambiInt.setRelation, ["evaEUR", "admin", "common"], da);
safeTransaction(ambiInt.setRelation, ["evaEUR", "setup", "common"], da);
safeTransaction(ambiInt.setRelation, ["evaEUR", "cron", "common"], da);
safeTransaction(ambiInt.setRelation, ["evaEUR", "fee", "common"], da);
safeTransaction(etokint.approve, [evaEUR.address, 100000, "EvaEUR"], da);
safeTransaction(etokEVA.transfer, [da, 100, "EvaEUR"], da);
safeTransaction(evaEUR.setOperationsCallGas, ["23861", "24711", "24606", "25734", "23232", "24658"], da);
safeTransaction(evaEUR.setWholeTokenPrice, [web3.toBigNumber(web3.toWei(0.1, 'ether')).mul(1.133), web3.toBigNumber(web3.toWei(0.11, 'ether')).mul(1.133)], da);
safeTransaction(evaEUR.setupTreasury, [nano1.address], da);
safeTransactions([
  safeTransactionFunction(evaEUR.setupFee, [feeAddress], da, {waitReceipt: true}),
  safeTransactionFunction(evaEUR.updateFeeGas, [], da, {waitReceipt: true}),
  safeTransactionFunction(evaEUR.updateFeeGas, [], da),
  safeTransactionFunction(evaEUR.updateRefundGas, [], da)
]);



safeTransactions([
  safeTransactionFunction(evaRUR.setAmbiAddress, [ambiInt.address, "evaRUR"], da, {waitReceipt: true}),
  safeTransactionFunction(ambiInt.setRelation, ["evaRUR", "admin", "common"], da),
  safeTransactionFunction(ambiInt.setRelation, ["evaRUR", "setup", "common"], da),
  safeTransactionFunction(ambiInt.setRelation, ["evaRUR", "cron", "common"], da),
  safeTransactionFunction(ambiInt.setRelation, ["evaRUR", "fee", "common"], da, {waitReceipt: true}),
  safeTransactionFunction(etokint.approve, [evaRUR.address, 100000, "EvaRUR"], da),
  safeTransactionFunction(etokEVA.transfer, [da, 100, "EvaRUR"], da),
  safeTransactionFunction(etokEVA.transfer, [da, 900, "EvaRUR"], da, {waitReceipt: true}),
  safeTransactionFunction(evaRUR.setOperationsCallGas, ["23861", "24711", "24606", "25734", "23232", "24658"], da),
  safeTransactionFunction(evaRUR.setWholeTokenPrice, [web3.toBigNumber(web3.toWei(0.1, 'ether')).mul(0.0153), web3.toBigNumber(web3.toWei(0.11, 'ether')).mul(0.0153)], da),
  safeTransactionFunction(evaRUR.setupTreasury, [nano1.address], da, {waitReceipt: true}),
  safeTransactionFunction(evaRUR.setupFee, [feeAddress], da, {waitReceipt: true}),
  safeTransactionFunction(evaRUR.updateFeeGas, [], da, {waitReceipt: true}),
  safeTransactionFunction(evaRUR.updateFeeGas, [], da),
  safeTransactionFunction(evaRUR.updateRefundGas, [], da)
]);

safeTransactions([
  safeTransactionFunction(evaUSD.setOperationsCallGas, ["23862", "24712", "24607", "25735", "23233", "24659"], da),
  safeTransactionFunction(evaEUR.setOperationsCallGas, ["23862", "24712", "24607", "25735", "23233", "24659"], da),
  safeTransactionFunction(evaRUR.setOperationsCallGas, ["23862", "24712", "24607", "25735", "23233", "24659"], da)
]);


// All offchain operations do with simple web3.
var balance = web3.eth.getBalance(da);
var tokenBalance = evaUSD.balanceOf(da);
var feeBalance = evaUSD.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(evaUSD.transfer.estimateGas(etokEVA.address, 1, {from: da, gasPrice: gasPrice})).mul(gasPrice).div(evaUSD.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(evaUSD.transfer.call(etokEVA.address, 1, {from: da, gasPrice: gasPrice}));

safeTransaction(evaUSD.transfer, [etokEVA.address, 1], da, {waitReceipt: true});

var transfer1 = web3.eth.getTransactionReceipt("^^^");
var transferShortage1 = balance.sub(web3.eth.getBalance(da)).div(gasPrice).toNumber();
console.log("Gas used for transfer 1: " + transfer1.gasUsed + " Shortage: " + transferShortage1);
var exactFee = web3.toBigNumber(transfer1.gasUsed - transferShortage1).mul(gasPrice).div(evaUSD.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transfer1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(evaUSD.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(evaUSD.balanceOf.call(da).add(1).add(actualFee).eq(tokenBalance));



var balance = web3.eth.getBalance(da);
var tokenBalance = evaUSD.balanceOf(da);
var feeBalance = evaUSD.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(evaUSD.approve.estimateGas(evaUSD.address, 10000, {from: da, gasPrice: gasPrice})).mul(gasPrice).div(evaUSD.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(evaUSD.approve.call(evaUSD.address, 10000, {from: da, gasPrice: gasPrice}));

safeTransaction(evaUSD.approve, [evaUSD.address, 10000], da, {waitReceipt: true});

var approve1 = web3.eth.getTransactionReceipt("^^^");
var approveShortage1 = balance.sub(web3.eth.getBalance(da)).div(gasPrice).toNumber();
console.log("Gas used for approve 1: " + approve1.gasUsed + " Shortage: " + approveShortage1);
var exactFee = web3.toBigNumber(approve1.gasUsed - approveShortage1).mul(gasPrice).div(evaUSD.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(approve1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(evaUSD.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(evaUSD.balanceOf.call(da).add(actualFee).eq(tokenBalance));


safeTransaction(etokEVA.transfer, ["0x3cad8c0bcc3b01d484f3d591c6eeb52a7e610cf2", 1001, "EvaRUR"], da, {waitReceipt: true}); // For Kirill for testing


var balance = web3.eth.getBalance(address);
var tokenBalance = evaRUR.balanceOf(address);
var feeBalance = evaRUR.balanceOf(feeAddress);
var tokenBalanceFrom = evaRUR.balanceOf("0x3cad8c0bcc3b01d484f3d591c6eeb52a7e610cf2");
var correctEstimateFee = web3.toBigNumber(evaRUR.transferFrom.estimateGas("0x3cad8c0bcc3b01d484f3d591c6eeb52a7e610cf2", address, 1, {from: address, gasPrice: gasPrice})).mul(gasPrice).div(evaRUR.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(evaRUR.transferFrom.call("0x3cad8c0bcc3b01d484f3d591c6eeb52a7e610cf2", address, 1, {from: address, gasPrice: gasPrice}));

safeTransaction(evaUSD.transferFrom, ["0x3cad8c0bcc3b01d484f3d591c6eeb52a7e610cf2", address, 1], address);

var transferFrom1 = web3.eth.getTransactionReceipt("^^^");
var transferFromShortage1 = balance.sub(web3.eth.getBalance(address)).div(gasPrice).toNumber();
console.log("Gas used for transferFrom 1: " + transferFrom1.gasUsed + " Shortage: " + transferFromShortage1);
var exactFee = web3.toBigNumber(transferFrom1.gasUsed - transferFromShortage1).mul(gasPrice).div(evaRUR.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferFrom1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(evaRUR.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(evaRUR.balanceOf.call(address).eq(tokenBalance.add(1)));
console.log(evaRUR.balanceOf.call("0x3cad8c0bcc3b01d484f3d591c6eeb52a7e610cf2").add(1).add(actualFee).eq(tokenBalanceFrom));


// 64 is for 1 additional byte (2 bytes already there) in the amount field. So that refund will result in 0 difference if user sends 65793 - 16777215 tokens, with some exceptions.
safeTransactions([
  safeTransactionFunction(evaUSD.setOperationsCallGas, [23862 + 64, 24712 + 64, 24607 + 64, 25735 + 64, 23233 + 64, "24659"], da),
  safeTransactionFunction(evaEUR.setOperationsCallGas, [23862 + 64, 24712 + 64, 24607 + 64, 25735 + 64, 23233 + 64, "24659"], da),
  safeTransactionFunction(evaRUR.setOperationsCallGas, [23862 + 64, 24712 + 64, 24607 + 64, 25735 + 64, 23233 + 64, "24659"], da)
]);
























var pot = web3.eth.contract([{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[],"name":"round","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_periodicity","type":"uint256"},{"name":"_auctionSize","type":"uint8"},{"name":"_prize","type":"uint256"},{"name":"_minTx","type":"uint256"},{"name":"_counter","type":"uint256"},{"name":"_startTime","type":"uint256"}],"name":"configure","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"minTx","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"counter","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"elcoin","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"startTime","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_ambi","type":"address"},{"name":"_name","type":"bytes32"}],"name":"setAmbiAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"transactions","outputs":[{"name":"from","type":"address"},{"name":"amount","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[],"name":"remove","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transfer","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"},{"name":"","type":"address"}],"name":"prizes","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"prize","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"auctionSize","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[],"name":"periodicity","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"beneficiary","type":"address"},{"indexed":true,"name":"round","type":"uint256"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"position","type":"uint256"}],"name":"Reward","type":"event"}]);
pot.new(
  {
    from: address,
    data: '0x606060405260006002600050556000600360005055610b53806100226000396000f3606060405236156100c45760e060020a600035046306fdde0381146100c6578063146ca531146100cf57806321f8a721146100d857806347f3d7941461014f578063533a645c1461023557806361bc221a1461023e5780637001a2a21461024757806378e97925146102595780637948f523146102625780639ace38c214610287578063a7f43779146102d7578063beabacc8146102fe578063d051dfd3146103ce578063e3ac5d26146103f3578063eed65c11146103fc578063f4462d0414610408575b005b61041160015481565b61041160025481565b6104236004355b60408051600080547f2ade6c360000000000000000000000000000000000000000000000000000000083526004830185905292519092600160a060020a031691632ade6c36916024828101926020929190829003018187876161da5a03f115610002575050604051519392505050565b61041160043560243560443560643560843560a435600080547f6f776e657200000000000000000000000000000000000000000000000000000090600160a060020a03168214801590610202575060408051835460015460e460020a630a1add5102835260048301526024820184905233600160a060020a039081166044840152925192169163a1add51091606481810192602092909190829003018188876161da5a03f1156100025750506040515190505b1561057057878760ff1611806102185750856000145b80610226575060ff8760ff16115b1561057c576000915050610572565b61041160085481565b61041160035481565b610423600a54600160a060020a031681565b61041160095481565b6104116004356024356000805481908190600160a060020a0316811461049f57610497565b6104406004356004805482908110156100025750600052600202600080516020610b33833981519152810154600080516020610b138339815191529190910154600160a060020a03919091169082565b6100c4600054600160a060020a0390811633909116141561056e5733600160a060020a0316ff5b6100c46004356024356044356000805460d160020a6532b631b7b4b70291600160a060020a039091161480159061039b5750600080546001546040805160e460020a630a1add5102815260048101929092526024820185905233600160a060020a039081166044840152905192169263a1add5109260648381019360209390839003909101908290876161da5a03f1156100025750506040515190505b156105d557600554600014806103b6575060065460ff166000145b806103c357506007546000145b156105dc57506105d7565b600b602090815260043560009081526040808220909252602435815220546104119081565b61041160075481565b61046660065460ff1681565b61041160055481565b60408051918252519081900360200190f35b60408051600160a060020a03929092168252519081900360200190f35b6040518083600160a060020a031681526020018281526020019250505060405180910390f35b6040805160ff929092168252519081900360200190f35b600184815560008054600160a060020a0319168417905592505b505092915050565b84915030600160a060020a031682600160a060020a0316632ade6c36866040518260e060020a028152600401808281526020019150506020604051808303816000876161da5a03f11561000257505060405151600160a060020a0316909114905061047d5781600160a060020a0316637684937685306040518360e060020a0281526004018083815260200182600160a060020a03168152602001925050506020604051808303816000876161da5a03f1156100025750506040515191505080151561047d5760009250610497565b565b505b9695505050505050565b60058890556006805460ff19168817905560078690556008859055600384905560098390556105b660d160020a6532b631b7b4b7026100df565b600a8054600160a060020a03191690911790555060019050610572565b505b505b505050565b60038054600101905560085482108015906106145750600660009054906101000a900460ff1660ff1660056000505403600360005054115b1561068c576004805460018101808355828183801582901161064f5760020281600202836000526020600020918201910161064f9190610885565b50505060009283525060209182902060408051808201909152878152909201849052600202018054600160a060020a031916851781556001018290555b600554600354106105d55761085360408051602081810183526000808352835191820184528082526006549351909384928392909183918291829182918291829160ff16908059106106db5750595b9080825280602002602001820160405250995060009850600097505b60045460ff891610156108ae578a60046000508960ff16815481101561000257600091909152600202600080516020610b1383398151915201541415610793576004805460ff8a169081101561000257600202600080516020610b3383398151915201548b5160018c019b600160a060020a039290921692508c919081101561000257600160a060020a03929092166020928302909101909101525b8a60046000508960ff16815481101561000257600091909152600202600080516020610b1383398151915201541115610847576004805460ff8a1690811015610002578154600291909102600080516020610b1383398151915201549c5060009a5060ff8a169081101561000257600202600080516020610b3383398151915201548b5160019b600160a060020a039290921692508c91908110156100025750600160a060020a0391909116602091909101525b600197909701966106f7565b600060038190556002805460010181556004805483825592526105d39102600080516020610b33833981519152908101905b808211156108aa578054600160a060020a031916815560006001820155600201610885565b5090565b88600014156108c5575b5050505050505050505050565b886040518059106108d35750595b90808252806020026020018201604052509650600095506109016000426009600050541115610af657610b10565b61090d57600754610914565b6007546002025b94508885049350600092505b888360ff1610156109d457898360ff168151811015610002576002546020918202929092018101516000928352600b82526040808420600160a060020a038316855290925290822054909350141561099d57818787806001019850815181101561000257600160a060020a03929092166020928302909101909101525b6002546000908152600b60209081526040808320600160a060020a0386168452909152902080548501905560019290920191610920565b600092505b858360ff1610156108b857868360ff1681518110156100025760025460209182029092018101516000928352600b82526040808420600160a060020a0383811680875291855282862054600a5484517ff8b71c6400000000000000000000000000000000000000000000000000000000815260048101949094526024840182905293519498509650919091169363f8b71c6493604483810194919391929183900301908290876161da5a03f11561000257505060405151159050610aea5760026000505482600160a060020a03167fe417c38cb96e748006d0ef1a56fec0de428abac103b6644bc30c745f54f543458386604051808381526020018260ff1681526020019250505060405180910390a35b600192909201916109d9565b610168620151806009600050544203046001010660001490505b90568a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19c8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b',
    gas: 3000000
  }, function(e, contract){
  console.log(e, contract);
  if (typeof contract.address != 'undefined') {
    console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    pot = pot.at(contract.address);
    // each 10 transactions 10 Elc would be divided amongst people who sent more that 1 Elc, counter starts at 0, startTime is 00:00 of today:
    safeTransactions([
      safeTransactionFunction(ambiInt.removeNode, ["elcoinPoT"], address, {waitReceipt: true, ignoreCallResponse: true}),
      safeTransactionFunction(pot.setAmbiAddress, [ambiInt.address, "elcoinPoT"], address, {waitReceipt: true}),
      safeTransactionFunction(ambiInt.setRelation, ["elcoinPoT", "elcoin", "elcoin"],  address),
      safeTransactionFunction(ambiInt.setRelation, ["elcoin", "reward", "elcoinPoT"],  address),
      safeTransactionFunction(ambiInt.setRelation, ["elcoinPoT", "owner", "common"],  address, {waitReceipt: true}),
      safeTransactionFunction(pot.configure, [10, 10, 10000000, 1000000, 0, dayStartNow()],  address, {waitReceipt: true})
    ]);
  }
})



safeTransactionFunction(nano1.addAddress, [evaUSD.address], da),
safeTransactionFunction(nano1.addAddress, [evaEUR.address], da),
safeTransactionFunction(nano1.addAddress, [evaRUR.address], da)


safeTransaction(pot.configure, [10, 10, 10000000, 1000000, 0, dayStartNow() - 86400*360],  address, {waitReceipt: true})


setPrivateKey('PKof0xb5606469f317018d21f504b6e1518e54b23fa761');
var ambi = eth.contract(JSON.parse('[{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"owners","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_node","type":"bytes32"}],"name":"removeNode","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"relationIndex","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"nodes","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"bytes32"}],"name":"setRelation","outputs":[{"name":"","type":"int8"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getNodeAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_addr","type":"address"}],"name":"changeNodeAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_addr","type":"address"}],"name":"addNode","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_operation","type":"bytes32"},{"name":"_signer","type":"bytes32"}],"name":"isSigned","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"bytes32"}],"name":"isRelation","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"}],"name":"getChildCount","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"address"}],"name":"hasRelation","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_pos","type":"uint8"}],"name":"getChildAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"nodeIndex","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"addresses","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"relations","outputs":[{"name":"relation","type":"bytes32"},{"name":"parent","type":"bytes32"},{"name":"numChildren","type":"uint8"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"bytes32"}],"name":"removeChild","outputs":[{"name":"","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"}]')).at('0xa0c446bd3d10dc375523bc56be956a6b54b2964a');
safeTransactions([
  safeTransactionFunction(ambi.addNode, ["antonT", "0xd94440b42e32a98da08dba34884e8c35485ba551"], address),
  safeTransactionFunction(ambi.addNode, ["antonS", "0x1b0598ec7e538deae709e8e9116bbdc43bc971dc"], address, {waitReceipt: true}),
  safeTransactionFunction(ambi.setRelation, ["access1", "signer", "antonT"], address),
  safeTransactionFunction(ambi.setRelation, ["access1", "signer", "antonS"], address, {waitReceipt: true})
]);








// Redeploy elcoin
var issueAddress = address; // if you want to issue more coins on deploy.
var issueAmount = 0;
var elcoinDeployData = '0x60606040526404e3b29200600955615208600a55613a98600b556003805460018101808355909190828015829011605657818360005260206000209182019101605691905b8082111560b257600081556001016044565b505060088054600160a060020a031916321790555060b69050600080600181801560c557600160a060020a03338116903216837f4be6c20aede7dc7a2a5f9377a665a16687d76e6c5c6e8016cad407f7d5218425846060a460d7565b5090565b506119ec806100de6000396000f35b50600582905560068290556007819055805b939250505056606060405236156101695760e060020a600035046306fdde03811461016b578063095ea7b31461017457806313c8a3761461018657806318160ddd146101cc5780631a1feae1146101d557806321f8a721146101de57806323b872dd1461025757806324c65f351461026d57806339e7fddc146103255780633f2f159614610337578063431e83ce146103e95780634f6d3aed146103f25780635b65b9ab146103fb57806363f80de31461052257806370a08231146106135780637948f5231461064a5780637fd6f15c1461066f57806388d695b2146106785780638f0c724c146107d657806399a5d74714610880578063a7f43779146108a9578063a9059cbb1461095e578063aa64c43b14610982578063ace3088314610a3c578063b2478cfe14610a45578063b2855b4f14610a5d578063be78bb7a14610b15578063c71cbcf314610b1e578063dd62ed3e14610174578063f8b71c6414610bf9578063fbf1f78a14610cb2575b005b610cb560015481565b610cb560043560243560005b92915050565b610cc760043560038054829081101561000257506000527fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b0154600160a060020a031681565b610cb560045481565b610cb560095481565b610cc76004355b60408051600080547f2ade6c360000000000000000000000000000000000000000000000000000000083526004830185905292519092600160a060020a031691632ade6c36916024828101926020929190829003018187876161da5a03f115610002575050604051519150505b919050565b610cb560043560243560443560005b9392505050565b610cb56000805481908190609960020a6c31bab93932b731bca7bbb732b90290600160a060020a03168214801590610305575060408051835460015460e460020a630a1add5102835260048301526024820184905233600160a060020a039081166044840152925192169163a1add51091606481810192602092909190829003018188876161da5a03f1156100025750506040515190505b15610ce4575a92503a600b600050545a850301029150610ceb6001610d0c565b610cc7600854600160a060020a031681565b610cb560043560243560008054609960020a6c31bab93932b731bca7bbb732b90290600160a060020a031682148015906103d1575060408051835460015460e460020a630a1add5102835260048301526024820184905233600160a060020a039081166044840152925192169163a1add51091606481810192602092909190829003018188876161da5a03f1156100025750506040515190505b15610db1578260001415610db8576000915050610180565b610cb560075481565b610cb5600b5481565b610cb5600435602435604435600080547f63726f6e0000000000000000000000000000000000000000000000000000000090600160a060020a031682148015906104a5575060408051835460015460e460020a630a1add5102835260048301526024820184905233600160a060020a039081166044840152925192169163a1add51091606481810192602092909190829003018188876161da5a03f1156100025750506040515190505b1561060b57610e2a858585600060008410806104c15750600083105b806104cd575061271083115b806104d85750600082105b806104e257508382105b156113ca5733600160a060020a031632600160a060020a031660016000805160206119cc83398151915260405180905060405180910390a4506000610266565b610cb5600435602435604435600080548190609960020a6c31bab93932b731bca7bbb732b90290600160a060020a031682148015906105c1575060408051835460015460e460020a630a1add5102835260048301526024820184905233600160a060020a039081166044840152925192169163a1add51091606481810192602092909190829003018188876161da5a03f1156100025750506040515190505b15610e32576004546000901115610e3b5733600160a060020a031632600160a060020a031660066000805160206119cc83398151915260405180905060405180910390a460009250505b509392505050565b610cb56004356000610ec05b60006113e17f656c636f696e44620000000000000000000000000000000000000000000000006101e5565b610cb56004356024356000805481908190600160a060020a03168114610f3957610f31565b610cb560065481565b60408051600480358082013560208181028086018201909652818552610cb59593946024949093850192918291908501908490808284375050604080518735808a013560208181028085018201909552818452989a99604499939850919091019550935083925085019084908082843750949650505050505050600080548190819081908190609960020a6c31bab93932b731bca7bbb732b90290600160a060020a0316821480159061078b575060408051835460015460e460020a630a1add5102835260048301526024820184905233600160a060020a039081166044840152925192169163a1add51091606481810192602092909190829003018188876161da5a03f1156100025750506040515190505b156110085786518851146110145733600160a060020a031632600160a060020a031660076000805160206119cc83398151915260405180905060405180910390a4600095505061100a565b610cb560043560008054609960020a6c31bab93932b731bca7bbb732b90290600160a060020a0316821480159061086d575060408051835460015460e460020a630a1add5102835260048301526024820184905233600160a060020a039081166044840152925192169163a1add51091606481810192602092909190829003018188876161da5a03f1156100025750506040515190505b15611293575050600a8190556001610252565b610cb56004355b6006546005546000916127109084020490811015611299576005549150611293565b60008054610169917f6f776e657200000000000000000000000000000000000000000000000000000091600160a060020a03161480159061094d5750604080516000805460015460e460020a630a1add5102845260048401526024830185905233600160a060020a039081166044850152935193169263a1add5109260648181019360209392839003909101908290876161da5a03f1156100025750506040515190505b156112ad5733600160a060020a0316ff5b610cb5600435602435600060006000600a600050545a0191506112b06112bf61061f565b610cb5600435602435604435600080547f706f6f6c0000000000000000000000000000000000000000000000000000000090600160a060020a03168214801590610a2c575060408051835460015460e460020a630a1add5102835260048301526024820184905233600160a060020a039081166044840152925192169163a1add51091606481810192602092909190829003018188876161da5a03f1156100025750506040515190505b1561060b57610e2a6112ed61061f565b610cb560055481565b610cb560043560026020526000908152604090205481565b61016960043560008054609960020a6c31bab93932b731bca7bbb732b90291600160a060020a039190911614801590610af95750604080516000805460015460e460020a630a1add5102845260048401526024830185905233600160a060020a039081166044850152935193169263a1add5109260648181019360209392839003909101908290876161da5a03f1156100025750506040515190505b15610b115760088054600160a060020a031916831790555b5050565b610cb5600a5481565b610cb5600435602435600080547f7265636f7665727900000000000000000000000000000000000000000000000090600160a060020a03168214801590610bc8575081546001546040805160e460020a630a1add5102815260048101929092526024820184905233600160a060020a039081166044840152905192169163a1add51091606481810192602092909190829003018188876161da5a03f1156100025750506040515190505b15610db157600160a060020a038416600090815260026020526040812054859114156112f5576112fc61130561061f565b610cb56004356024356000805481907f726577617264000000000000000000000000000000000000000000000000000090600160a060020a03168214801590610ca5575081546001546040805160e460020a630a1add5102815260048101929092526024820184905233600160a060020a039081166044840152905192169163a1add51091606481810192602092909190829003018188876161da5a03f1156100025750506040515190505b15610f3157610d2f61061f565b60005b60408051918252519081900360200190f35b60408051600160a060020a03929092168252519081900360200190f35b505b505090565b1515610d1e576000935050610ce6565b600b543a905a8403010290506112e6815b6009546000903a111561134f57610252565b5a8303600b8190559350610ce69050565b600160a060020a031663ec2ac54e8686600060006040518560e060020a0281526004018085600160a060020a031681526020018481526020018360010281526020018281526020019450505050506020604051808303816000876161da5a03f115610002575050604051519250508115610dac5760048054850190555b819250505b5092915050565b600c8054600160a060020a031916851790556009839055600034118015610e165750600c60009054906101000a9004600160a060020a0316600160a060020a0316600034604051809050600060405180830381858888f19350505050155b15610e2057610002565b6001915050610180565b915050610266565b50509392505050565b610e4361061f565b600160a060020a031663ec2ac54e8787600060006040518560e060020a0281526004018085600160a060020a031681526020018481526020018360010281526020018281526020019450505050506020604051808303816000876161da5a03f115610002575050604051516004869055935083925061060b915050565b600160a060020a031663f8b2cb4f836040518260e060020a0281526004018082600160a060020a031681526020019150506020604051808303816000876161da5a03f1156100025750506040515191506102529050565b600184815560008054600160a060020a0319168417905592505b505092915050565b84915030600160a060020a031682600160a060020a0316632ade6c36866040518260e060020a028152600401808281526020019150506020604051808303816000876161da5a03f11561000257505060405151600160a060020a03169091149050610f175781600160a060020a0316637684937685306040518360e060020a0281526004018083815260200182600160a060020a03168152602001925050506020604051808303816000876161da5a03f11561000257505060405151915050801515610f175760009250610f31565b505b5050505092915050565b60009450600093505b86518460ff16101561105157868460ff1681518110156100025760209081029091010151909401936001939093019261101d565b61105961061f565b92508483600160a060020a031663f8b2cb4f336040518260e060020a0281526004018082600160a060020a031681526020019150506020604051808303816000876161da5a03f11561000257505060405151919091101590506110f35733600160a060020a031632600160a060020a031660086000805160206119cc83398151915260405180905060405180910390a4600095505061100a565b82600160a060020a03166307bc6fad3387600060006040518560e060020a0281526004018085600160a060020a031681526020018481526020018360010281526020018281526020019450505050506020604051808303816000876161da5a03f11561000257506000935050505b87518260ff1610156112855782600160a060020a031663ec2ac54e898460ff1681518110156100025790602001906020020151898560ff1681518110156100025790602001906020020151600060006040518560e060020a0281526004018085600160a060020a031681526020018481526020018360010281526020018281526020019450505050506020604051808303816000876161da5a03f115610002575050885189915060ff8416908110156100025790602001906020020151600160a060020a031633600160a060020a03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef898560ff16815181101561000257604080516020928302909301820151835251918290030190a360019190910190611161565b600195505061100a565b8091505b50919050565b60075481111561128f576007549150611293565b50565b1515610cfb5760009250610f31565b3387875b6000600060006114dd878787876000600060056000505483101561178257611779565b9250610f31565b8686866112c3565b5050610180565b92505050610180565b86866003805460018101808355600092839283928392908280158290116115735781836000526020600020918201910161157391905b808211156116fd576000815560010161133b565b60408051600c547ff3fef3a300000000000000000000000000000000000000000000000000000000825232600160a060020a03908116600484015260248301869052925192169163f3fef3a39160448181019260209290919082900301816000876161da5a03f1156100025750506040515191506102529050565b506005839055600682905560078190556001610266565b905090565b9050600160a060020a0382166000146114575781600160a060020a031663ba45b0b887876040518360e060020a0281526004018083600160a060020a0316815260200182600160a060020a03168152602001925050506000604051808303816000876161da5a03f115610002575050505b600160a060020a0381166000146114ce5780600160a060020a031663beabacc88787876040518460e060020a0281526004018084600160a060020a0316815260200183600160a060020a0316815260200182815260200193505050506000604051808303816000876161da5a03f115610002575050505b600192505b5050949350505050565b151561151f5733600160a060020a031632600160a060020a031660026000805160206119cc83398151915260405180905060405180910390a4600092506114d3565b6115487f656c636f696e506f5300000000000000000000000000000000000000000000006101e5565b91506113e67f656c636f696e506f5400000000000000000000000000000000000000000000006101e5565b5050509250856003600050848154811015610002575050507fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b83018054600160a060020a03191687179055600160a060020a03868116600081815260026020908152604080832088905580517ff8b2cb4f000000000000000000000000000000000000000000000000000000008152600481019490945251938b169363f8b2cb4f936024818101949183900301908290876161da5a03f1156100025750506040805180517f07bc6fad000000000000000000000000000000000000000000000000000000008252600160a060020a038a166004830152602482018190526000604483018190526064830181905292519095506307bc6fad926084838101936020939290839003909101908290876161da5a03f115610002575050604051519150508015156117015733600160a060020a031632600160a060020a031660056000805160206119cc83398151915260405180905060405180910390a4600093505b5050509392505050565b5090565b86600160a060020a031663ec2ac54e8684600060006040518560e060020a0281526004018085600160a060020a031681526020018481526020018360010281526020018281526020019450505050506020604051808303816000876161da5a03f1156100025750600195506116f3915050565b600191505b50949350505050565b83600160a060020a031685600160a060020a031614156117a55760009150611779565b85600160a060020a031663f8b2cb4f866040518260e060020a0281526004018082600160a060020a031681526020019150506020604051808303816000876161da5a03f11561000257505060405151915050828110156118085760009150611779565b611774868686866000600085600160a060020a03166307bc6fad8685600060006040518560e060020a0281526004018085600160a060020a031681526020018481526020018360010281526020018281526020019450505050506020604051808303816000876161da5a03f11561000257506118879150849050610887565b9150818303905085600160a060020a031663ec2ac54e8583600060006040518560e060020a0281526004018085600160a060020a031681526020018481526020018360010281526020018281526020019450505050506020604051808303816000876161da5a03f115610002575050604080518581529051600160a060020a0387811693508816917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef919081900360200190a360008211156119c457604080516008547fec2ac54e000000000000000000000000000000000000000000000000000000008252600160a060020a039081166004830152602482018590526000604483018190526064830181905292519089169263ec2ac54e926084818101936020939092839003909101908290876161da5a03f115610002575050505b505050505050564be6c20aede7dc7a2a5f9377a665a16687d76e6c5c6e8016cad407f7d5218425';
var elcoinIntOld = eth.contract([{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"recovered","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"ambi","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"feeAddr","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"absMaxFee","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_absMinFee","type":"uint256"},{"name":"_feePercent","type":"uint256"},{"name":"_absMaxFee","type":"uint256"}],"name":"setFee","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_ambi","type":"address"},{"name":"_name","type":"bytes32"}],"name":"setAmbiAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"feePercent","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address[]"},{"name":"_value","type":"uint256[]"}],"name":"batchTransfer","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_amount","type":"uint256"}],"name":"calculateFee","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[],"name":"remove","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferPool","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"issueCoin","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"absMinFee","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"recoveredIndex","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_feeAddr","type":"address"}],"name":"setFeeAddr","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_old","type":"address"},{"name":"_new","type":"address"}],"name":"recoverAccount","outputs":[{"name":"status","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"rewardTo","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"}],"name":"unapprove","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"code","type":"uint8"},{"indexed":true,"name":"origin","type":"address"},{"indexed":true,"name":"sender","type":"address"}],"name":"Error","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"}],"name":"Unapproved","type":"event"}]
).at('0x90a38668249f714fe628eebb78f4da488031684b');
var ambiInt = eth.contract([{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"owners","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_node","type":"bytes32"}],"name":"removeNode","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"relationIndex","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"nodes","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"bytes32"}],"name":"setRelation","outputs":[{"name":"","type":"int8"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getNodeAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_addr","type":"address"}],"name":"changeNodeAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_addr","type":"address"}],"name":"addNode","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_operation","type":"bytes32"},{"name":"_signer","type":"bytes32"}],"name":"isSigned","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"bytes32"}],"name":"isRelation","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"}],"name":"getChildCount","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"address"}],"name":"hasRelation","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_pos","type":"uint8"}],"name":"getChildAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"nodeIndex","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"addresses","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"relations","outputs":[{"name":"relation","type":"bytes32"},{"name":"parent","type":"bytes32"},{"name":"numChildren","type":"uint8"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"bytes32"}],"name":"removeChild","outputs":[{"name":"","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"}]
).at('0xa0c446bd3d10dc375523bc56be956a6b54b2964a');
var dbInt = eth.contract([{"constant":false,"inputs":[{"name":"addr","type":"address"},{"name":"amount","type":"uint256"},{"name":"hash","type":"bytes32"},{"name":"time","type":"uint256"}],"name":"withdraw","outputs":[{"name":"res","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"pOwner","type":"address"}],"name":"setOwner","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"name":"rv","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"getCaller","outputs":[{"name":"rv","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"pCaller","type":"address"}],"name":"setCaller","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"},{"name":"amount","type":"uint256"},{"name":"hash","type":"bytes32"},{"name":"time","type":"uint256"}],"name":"deposit","outputs":[{"name":"res","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"getBalance","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},{"inputs":[{"name":"pCaller","type":"address"}],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"hash","type":"bytes32"},{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"time","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Transaction","type":"event"}]
).at('0xa8adc4100498942e9d2615cec27594980738dadc');
var potInt = eth.contract([{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[],"name":"round","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_periodicity","type":"uint256"},{"name":"_auctionSize","type":"uint8"},{"name":"_prize","type":"uint256"},{"name":"_minTx","type":"uint256"},{"name":"_counter","type":"uint256"},{"name":"_startTime","type":"uint256"}],"name":"configure","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"minTx","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"counter","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"elcoin","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"startTime","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_ambi","type":"address"},{"name":"_name","type":"bytes32"}],"name":"setAmbiAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"transactions","outputs":[{"name":"from","type":"address"},{"name":"amount","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[],"name":"remove","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transfer","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"},{"name":"","type":"address"}],"name":"prizes","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"prize","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"auctionSize","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[],"name":"periodicity","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"beneficiary","type":"address"},{"indexed":true,"name":"round","type":"uint256"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"position","type":"uint256"}],"name":"Reward","type":"event"}]
).at('0x86ee51df9db214218cbb1b73aebe3c159000096e');
var elcoinInt = web3.eth.contract([{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"recovered","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"txGasPriceLimit","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":false,"inputs":[],"name":"updateRefundGas","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"feeAddr","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_treasury","type":"address"},{"name":"_txGasPriceLimit","type":"uint256"}],"name":"setupTreasury","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"absMaxFee","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"refundGas","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_absMinFee","type":"uint256"},{"name":"_feePercent","type":"uint256"},{"name":"_absMaxFee","type":"uint256"}],"name":"setFee","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_totalSupply","type":"uint256"}],"name":"issueCoin","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_ambi","type":"address"},{"name":"_name","type":"bytes32"}],"name":"setAmbiAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"feePercent","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address[]"},{"name":"_value","type":"uint256[]"}],"name":"batchTransfer","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_transfer","type":"uint256"}],"name":"setOperationsCallGas","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_amount","type":"uint256"}],"name":"calculateFee","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[],"name":"remove","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferPool","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"absMinFee","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"recoveredIndex","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_feeAddr","type":"address"}],"name":"setFeeAddr","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"transferCallGas","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_old","type":"address"},{"name":"_new","type":"address"}],"name":"recoverAccount","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"rewardTo","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"}],"name":"unapprove","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"code","type":"uint8"},{"indexed":true,"name":"origin","type":"address"},{"indexed":true,"name":"sender","type":"address"}],"name":"Error","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"}],"name":"Unapproved","type":"event"}]);
elcoinInt.new(
  {
    from: address,
    data: elcoinDeployData,
    gas: 3000000
  },
  function(e, contract) {
    console.log(e, contract);
    if (typeof contract.address != 'undefined') {
      console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
      elcoinInt = elcoinInt.at(contract.address);
      var testObj = {};
      safeTransactions([
        callFunction(elcoinIntOld, ['feeAddr', 'totalSupply'], testObj),
        safeTransactionFunction(ambiInt.changeNodeAddress, ["elcoin", elcoinInt.address], address, {waitReceipt: true}),
        safeTransactionFunction(elcoinInt.setAmbiAddress, [ambiInt.address, "elcoin"], address, {waitReceipt: true}),
        safeTransactionFunction(elcoinInt.setFeeAddr, [function() { return testObj.feeAddr; }], address),
        safeTransactionFunction(elcoinInt.issueCoin, [issueAddress, 0, function() { return testObj.totalSupply; }], address),
        // This is only for prod. On integration we have elcoinDb with AmbiEnabled. safeTransactionFunction(dbInt.setCaller, [elcoinInt.address], address),
        callFunction(potInt, ['periodicity', 'auctionSize', 'prize', 'minTx', 'counter', 'startTime'], testObj),
        safeTransactionFunction(potInt.configure, [
          function() { return testObj.periodicity; },
          function() { return testObj.auctionSize; },
          function() { return testObj.prize; },
          function() { return testObj.minTx; },
          function() { return testObj.counter; },
          function() { return testObj.startTime; }
        ], address, {waitReceipt: true}),
        syncFunction(function() { log("Now perform transactions in MasterWallet: setRecipient to '" + elcoinInt.address + "', setFee to '30000, 10, 7000000', ask Kirill to update elcoin address for fee in django app.", $logs); })
      ]);
    }
  }
);




// Deploy and configure refunder for elcoin.
// Preconditions: deployed elcoin contract.
// Make sure you have > 1.1 ether on your address.
var elcoinInt = eth.contract([{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"recovered","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"txGasPriceLimit","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":false,"inputs":[],"name":"updateRefundGas","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"feeAddr","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_treasury","type":"address"},{"name":"_txGasPriceLimit","type":"uint256"}],"name":"setupTreasury","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"absMaxFee","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"refundGas","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_absMinFee","type":"uint256"},{"name":"_feePercent","type":"uint256"},{"name":"_absMaxFee","type":"uint256"}],"name":"setFee","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_totalSupply","type":"uint256"}],"name":"issueCoin","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_ambi","type":"address"},{"name":"_name","type":"bytes32"}],"name":"setAmbiAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"feePercent","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address[]"},{"name":"_value","type":"uint256[]"}],"name":"batchTransfer","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_transfer","type":"uint256"}],"name":"setOperationsCallGas","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_amount","type":"uint256"}],"name":"calculateFee","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[],"name":"remove","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferPool","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"absMinFee","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"recoveredIndex","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_feeAddr","type":"address"}],"name":"setFeeAddr","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"transferCallGas","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_old","type":"address"},{"name":"_new","type":"address"}],"name":"recoverAccount","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"rewardTo","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"}],"name":"unapprove","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"code","type":"uint8"},{"indexed":true,"name":"origin","type":"address"},{"indexed":true,"name":"sender","type":"address"}],"name":"Error","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"}],"name":"Unapproved","type":"event"}]
).at('0xfe1a96cd0bfb3245d83808b9aba6538576145920');
var calibratingTransferTo = '0x913438389be0b3bdd08e812ecde9be9a6c17864f';
var calibratingTransferAmount = 0x0a0101; // 3 non zero bytes
var myNodeName = 'common';
var gasPrice = web3.toBigNumber(web3.toWei(20, 'gwei'));
var ambiInt = eth.contract([{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"owners","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_node","type":"bytes32"}],"name":"removeNode","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"relationIndex","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"nodes","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"bytes32"}],"name":"setRelation","outputs":[{"name":"","type":"int8"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getNodeAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_addr","type":"address"}],"name":"changeNodeAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_addr","type":"address"}],"name":"addNode","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_operation","type":"bytes32"},{"name":"_signer","type":"bytes32"}],"name":"isSigned","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"bytes32"}],"name":"isRelation","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"}],"name":"getChildCount","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"address"}],"name":"hasRelation","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_pos","type":"uint8"}],"name":"getChildAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"nodeIndex","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"addresses","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"relations","outputs":[{"name":"relation","type":"bytes32"},{"name":"parent","type":"bytes32"},{"name":"numChildren","type":"uint8"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_role","type":"bytes32"},{"name":"_to","type":"bytes32"}],"name":"removeChild","outputs":[{"name":"","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"}]
).at('0xa0c446bd3d10dc375523bc56be956a6b54b2964a');
var nanoElcoinInt = eth.contract([{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"}],"name":"addAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"}],"name":"removeAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_ambi","type":"address"},{"name":"_name","type":"bytes32"}],"name":"setAmbiAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"hasAccess","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[],"name":"remove","outputs":[],"type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_reference","type":"string"}],"name":"withdrawWithReference","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"withdraw","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_reference","type":"string"}],"name":"depositWithReference","outputs":[{"name":"","type":"bool"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"reference","type":"string"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"reference","type":"string"}],"name":"Withdrawal","type":"event"}]);
nanoElcoinInt.new(
  {
    from: address,
    data: '0x6060604052610753806100126000396000f36060604052361561008d5760e060020a600035046306fdde03811461009a57806321f8a721146100a357806338eada1c1461011b5780634ba79dfe146101dc5780637948f5231461029957806395a078e8146102be578063a7f43779146102d9578063d0e30db01461038e578063f359671c146103a5578063f3fef3a3146103fd578063f89005e71461044f575b61054a600061055c610392565b61054a60015481565b61056260043560408051600080547f2ade6c360000000000000000000000000000000000000000000000000000000083526004830185905292519092600160a060020a031691632ade6c36916024808301926020929190829003018187876161da5a03f1156100025750506040515191506105459050565b61054a6004356000805460d960020a6430b236b4b70290600160a060020a031682148015906101aa575060408051835460015460e460020a630a1add5102835260048301526024820184905233600160a060020a039081166044840152925192169163a1add51091606480820192602092909190829003018188876161da5a03f1156100025750506040515190505b15610588575050600160a060020a0381166000908152600260205260409020805460ff19166001908117909155610545565b61054a6004356000805460d960020a6430b236b4b70290600160a060020a0316821480159061026b575060408051835460015460e460020a630a1add5102835260048301526024820184905233600160a060020a039081166044840152925192169163a1add51091606480820192602092909190829003018188876161da5a03f1156100025750506040515190505b15610588575050600160a060020a0381166000908152600260205260409020805460ff191690556001610545565b61054a6004356024356000805481908190600160a060020a031681146105bd576105b5565b61054a60043560026020526000908152604090205460ff1681565b6000805461057e917f6f776e657200000000000000000000000000000000000000000000000000000091600160a060020a03161480159061037d5750604080516000805460015460e460020a630a1add5102845260048401526024830185905233600160a060020a039081166044850152935193169263a1add5109260648082019360209392839003909101908290876161da5a03f1156100025750506040515190505b1561068c5733600160a060020a0316ff5b61054a5b600060003411156105805750600161055f565b604080516020604435600481810135601f810184900484028501840190955284845261054a94813594602480359593946064949293910191819084018382808284375094965050505050505060006107458484610407565b61054a6004356024355b33600160a060020a031660009081526002602052604081205460ff161561044957604051600160a060020a038416908290849082818181858883f19450505050505b92915050565b6040805160206004803580820135601f810184900484028501840190955284845261054a949193602493909291840191908190840183828082843750949650505050505050600060003411156105415733600160a060020a03167f643e927b32d5bfd08eccd2fcbd97057ad413850f857a2359639114e8e8dd3d7b348460405180838152602001806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600f02600301f150905090810190601f1680156105325780820380516001836020036101000a031916815260200191505b50935050505060405180910390a25b5060015b919050565b60408051918252519081900360200190f35b90505b90565b60408051600160a060020a039092168252519081900360200190f35b005b50600061055f565b50919050565b60018481556000805473ffffffffffffffffffffffffffffffffffffffff19168417905592505b505092915050565b84915030600160a060020a031682600160a060020a0316632ade6c36866040518260e060020a028152600401808281526020019150506020604051808303816000876161da5a03f11561000257505060405151600160a060020a0316909114905061058e5781600160a060020a0316637684937685306040518360e060020a0281526004018083815260200182600160a060020a03168152602001925050506020604051808303816000876161da5a03f1156100025750506040515191505080151561058e57600092506105b5565b50565b83600160a060020a031633600160a060020a03167f2b0d35cc55a37536a00cf056f44b5f4b453659ddd18bc131a978463523ad3a1f858560405180838152602001806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600f02600301f150905090810190601f16801561072c5780820380516001836020036101000a031916815260200191505b50935050505060405180910390a35060015b9392505050565b151561068f5750600061073e56',
    gas: 3000000
  }, function(e, contract){
    console.log(e, contract);
    if (typeof contract.address != 'undefined') {
      console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
      nanoElcoinInt = nanoElcoinInt.at(contract.address);
      var testObj = {};
      safeTransactions([
        safeTransactionFunction(nanoElcoinInt.setAmbiAddress, [ambiInt.address, 'treasuryElcoin'], address, {waitReceipt: true}),
        safeTransactionFunction(ambiInt.setRelation, ['treasuryElcoin', 'admin', myNodeName], address, {waitReceipt: true}),
        safeTransactionFunction(nanoElcoinInt.addAddress, [address], address),
        safeTransactionFunction(nanoElcoinInt.addAddress, [elcoinInt.address], address),
        safeTransactionFunction(nanoElcoinInt.depositWithReference, ['First'], address, {value: web3.toWei(1, 'ether'), waitReceipt: true}),
        safeTransactionFunction(elcoinInt.setupTreasury, [nanoElcoinInt.address, web3.toWei(21, 'gwei')], address, {waitReceipt: true}),
        safeTransactionFunction(elcoinInt.updateRefundGas, [], address, {waitReceipt: true}),
        asyncFunction(function(resolve) {
          eth.getBalance(address, function(_, balance) {
            testObj.balanceBefore = balance;
            resolve();
          });
        }),
        safeTransactionFunction(elcoinInt.transfer, [calibratingTransferTo, calibratingTransferAmount], address, {waitReceipt: true, gasPrice: gasPrice}),
        asyncFunction(function(resolve, reject) {
          eth.getBalance(address, function(_, balance) {
            testObj.shortage = testObj.balanceBefore.sub(balance).div(gasPrice);
            log("Shortage was: " + testObj.shortage + " gas.", $logs);
            if (testObj.shortage.gt(5000)) {
              reject("Shortage is too big. Something went wrong.");
              return;
            }
            if (testObj.shortage.lt(0)) {
              reject("Shortage is too small. Something went wrong.");
              return;
            }
            resolve();
          });
        }),
        safeTransactionFunction(elcoinInt.setOperationsCallGas, [function() { return testObj.shortage.add(21000 + 128); }], address, {waitReceipt: true})
      ]);
    }
});