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

var _proxyfeeSetup = web3.eth.contract(assetwithfeeContract.abi).at("");
var proxyfee = web3.eth.contract(assetwithfeeContract.abi).at("");

var ambi = web3.eth.contract(ambiContract.abi).at("");

var treasury = web3.eth.contract(ethertreasurynanoContract.abi).at("");

var etok = web3.eth.contract(multiassetContract.abi).at("");

var cosigner = web3.eth.contract(cosignerContract.abi).at("");



ambi.addNode("dev", acc(), {from: acc()});
console.log(ambi.getNodeAddress.call("dev").valueOf() == acc());

//var symbol = "WEI";
//console.log(treasury.init.call(etok.address, symbol, {from: acc()}));
//treasury.init(etok.address, symbol, {from: acc()});
treasury.setAmbiAddress(ambi.address, "wei", {from: acc()});
console.log(ambi.getNodeAddress.call("wei").valueOf() == treasury.address);
ambi.setRelation("wei", "admin", "dev", {from: acc()});
console.log(ambi.isRelation.call("wei", "admin", "dev"));

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

console.log("1 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferCallGas(acc(1), 1000, {from: acc()})).gasUsed);
console.log("2 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferFromCallGas(acc(1), acc(2), 1000, {from: acc()})).gasUsed);
console.log("3 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferWithReferenceCallGas(acc(1), 1000, "a", {from: acc()})).gasUsed);
console.log("4 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferFromWithReferenceCallGas(acc(1), acc(2), 1000, "a", {from: acc()})).gasUsed);
console.log("5 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getApproveCallGas(acc(1), 1000, {from: acc()})).gasUsed);
console.log("6 " + web3.eth.getTransactionReceipt(_proxyfeeSetup.getForwardCallGas(cosignerAddress, "o", {from: acc()})).gasUsed);

proxyfee.setOperationsCallGas(
  web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferCallGas(acc(1), 1000, {from: acc()})).gasUsed,
  web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferFromCallGas(acc(1), acc(2), 1000, {from: acc()})).gasUsed,
  web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferWithReferenceCallGas(acc(1), 1000, "a", {from: acc()})).gasUsed,
  web3.eth.getTransactionReceipt(_proxyfeeSetup.getTransferFromWithReferenceCallGas(acc(1), acc(2), 1000, "a", {from: acc()})).gasUsed,
  web3.eth.getTransactionReceipt(_proxyfeeSetup.getApproveCallGas(acc(1), 1000, {from: acc()})).gasUsed,
  web3.eth.getTransactionReceipt(_proxyfeeSetup.getForwardCallGas(cosignerAddress, "o", {from: acc()})).gasUsed,
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
console.log(proxyfee.refundGas.call({from: acc()}).toNumber() < 8000);

console.log(proxyfee.setupExchange.call(exchangeAddress, 1, 2000, 500, 3000, {from: acc()}));
proxyfee.setupExchange(exchangeAddress, 1, 2000, 500, 3000, {from: acc()});
console.log(proxyfee.buyLimitMin.call().toNumber() == 1);
console.log(proxyfee.buyLimitMax.call().toNumber() == 2000);
console.log(proxyfee.sellLimitMin.call().toNumber() == 500);
console.log(proxyfee.sellLimitMax.call().toNumber() == 3000);

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transfer.estimateGas(acc(1), 100, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transfer.call(acc(1), 100, {from: acc(), gasPrice: gasPrice}));
var transfer1 = web3.eth.getTransactionReceipt(proxyfee.transfer(acc(1), 100, {from: acc(), gasPrice: gasPrice}));
var transferShortage1 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log("Gas used for transfer 1: " + transfer1.gasUsed + " Shortage: " + transferShortage1);
var exactFee = web3.toBigNumber(transfer1.gasUsed - transferShortage1).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transfer1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).add(100).add(actualFee).eq(tokenBalance));

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc()).toNumber();
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transfer.estimateGas(acc(1), 100, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
var transfer2 = web3.eth.getTransactionReceipt(proxyfee.transfer(acc(1), 100, {from: acc(), gasPrice: gasPrice}));
var transferShortage2 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferShortage1 == transferShortage2);
console.log("Gas used for transfer 2: " + transfer2.gasUsed + " Shortage: " + transferShortage2);
var exactFee = web3.toBigNumber(transfer2.gasUsed - transferShortage2).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
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
  proxyfee.forwardCallGas.call(),
  {from: acc()}
);

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc()).toNumber();
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transfer.estimateGas(acc(1), 100, {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
var transfer3 = web3.eth.getTransactionReceipt(proxyfee.transfer(acc(1), 100, {from: acc(), gasPrice: gasPrice}));
var transferShortage3 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferShortage3 == 0);
console.log("Gas used for transfer 3: " + transfer3.gasUsed + " Shortage: " + transferShortage3);
var exactFee = web3.toBigNumber(transfer3.gasUsed - transferShortage3).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transfer3.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).add(100).add(actualFee).eq(tokenBalance));




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
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFrom.estimateGas(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFrom.call(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice}));
var transferFrom1 = web3.eth.getTransactionReceipt(proxyfee.transferFrom(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice}));
var transferFromShortage1 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log("Gas used for transferFrom 1: " + transferFrom1.gasUsed + " Shortage: " + transferFromShortage1);
var exactFee = web3.toBigNumber(transferFrom1.gasUsed - transferFromShortage1).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
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
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFrom.estimateGas(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFrom.call(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice}));
var transferFrom2 = web3.eth.getTransactionReceipt(proxyfee.transferFrom(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice}));
var transferFromShortage2 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromShortage1 == transferFromShortage2);
console.log("Gas used for transferFrom 2: " + transferFrom2.gasUsed + " Shortage: " + transferFromShortage2);
var exactFee = web3.toBigNumber(transferFrom2.gasUsed - transferFromShortage2).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
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
  proxyfee.forwardCallGas.call(),
  {from: acc()}
);

var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFrom.estimateGas(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFrom.call(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice}));
var transferFrom3 = web3.eth.getTransactionReceipt(proxyfee.transferFrom(acc(), acc(1), 100, {from: acc(1), gasPrice: gasPrice}));
var transferFromShortage3 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromShortage3 == 0);
console.log("Gas used for transferFrom 3: " + transferFrom3.gasUsed + " Shortage: " + transferFromShortage3);
var exactFee = web3.toBigNumber(transferFrom3.gasUsed - transferFromShortage3).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
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
var correctEstimateFee = web3.toBigNumber(proxyfee.transferWithReference.estimateGas(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferWithReference.call(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReference1 = web3.eth.getTransactionReceipt(proxyfee.transferWithReference(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReferenceShortage1 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log("Gas used for transferWithReference 1: " + transferWithReference1.gasUsed + " Shortage: " + transferWithReferenceShortage1);
var exactFee = web3.toBigNumber(transferWithReference1.gasUsed - transferWithReferenceShortage1).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferWithReference1.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).eq(tokenBalance.sub(actualFee).sub(100)));

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transferWithReference.estimateGas(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferWithReference.call(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReference2 = web3.eth.getTransactionReceipt(proxyfee.transferWithReference(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReferenceShortage2 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferWithReferenceShortage1 == transferWithReferenceShortage2);
console.log("Gas used for transferWithReference 2: " + transferWithReference2.gasUsed + " Shortage: " + transferWithReferenceShortage2);
var exactFee = web3.toBigNumber(transferWithReference2.gasUsed - transferWithReferenceShortage2).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
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
  proxyfee.forwardCallGas.call(),
  {from: acc()}
);

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transferWithReference.estimateGas(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferWithReference.call(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReference3 = web3.eth.getTransactionReceipt(proxyfee.transferWithReference(acc(1), 100, "a", {from: acc(), gasPrice: gasPrice}));
var transferWithReferenceShortage3 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferWithReferenceShortage3 == 0);
console.log("Gas used for transferWithReference 3: " + transferWithReference3.gasUsed + " Shortage: " + transferWithReferenceShortage3);
var exactFee = web3.toBigNumber(transferWithReference3.gasUsed - transferWithReferenceShortage3).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferWithReference3.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc()).eq(tokenBalance.sub(actualFee).sub(100)));

var balance = web3.eth.getBalance(acc());
var tokenBalance = proxyfee.balanceOf(acc());
var feeBalance = proxyfee.balanceOf(feeAddress);
var correctEstimateFee = web3.toBigNumber(proxyfee.transferWithReference.estimateGas(acc(1), 100, "The invoice #123332", {from: acc(), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferWithReference.call(acc(1), 100, "The invoice #123332", {from: acc(), gasPrice: gasPrice}));
var transferWithReference4 = web3.eth.getTransactionReceipt(proxyfee.transferWithReference(acc(1), 100, "The invoice #123332", {from: acc(), gasPrice: gasPrice}));
var transferWithReferenceShortage4 = balance.sub(web3.eth.getBalance(acc())).div(gasPrice).toNumber();
console.log(transferWithReferenceShortage4 <= 0);
console.log("Gas used for transferWithReference 3: " + transferWithReference4.gasUsed + " Shortage: " + transferWithReferenceShortage4);
var exactFee = web3.toBigNumber(transferWithReference4.gasUsed - transferWithReferenceShortage4).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
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
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFromWithReference.estimateGas(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFromWithReference.call(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReference1 = web3.eth.getTransactionReceipt(proxyfee.transferFromWithReference(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReferenceShortage1 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log("Gas used for transferFromWithReference 1: " + transferFromWithReference1.gasUsed + " Shortage: " + transferFromWithReferenceShortage1);
var exactFee = web3.toBigNumber(transferFromWithReference1.gasUsed - transferFromWithReferenceShortage1).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
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
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFromWithReference.estimateGas(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFromWithReference.call(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReference2 = web3.eth.getTransactionReceipt(proxyfee.transferFromWithReference(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReferenceShortage2 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromWithReferenceShortage1 == transferFromWithReferenceShortage2);
console.log("Gas used for transferFromWithReference 2: " + transferFromWithReference2.gasUsed + " Shortage: " + transferFromWithReferenceShortage2);
var exactFee = web3.toBigNumber(transferFromWithReference2.gasUsed - transferFromWithReferenceShortage2).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
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
  proxyfee.forwardCallGas.call(),
  {from: acc()}
);

var balance = web3.eth.getBalance(acc(1));
var tokenBalance = proxyfee.balanceOf(acc(1));
var feeBalance = proxyfee.balanceOf(feeAddress);
var tokenBalanceFrom = proxyfee.balanceOf(acc());
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFromWithReference.estimateGas(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFromWithReference.call(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReference3 = web3.eth.getTransactionReceipt(proxyfee.transferFromWithReference(acc(), acc(1), 100, "a", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReferenceShortage3 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromWithReferenceShortage3 == 0);
console.log("Gas used for transferFromWithReference 3: " + transferFromWithReference3.gasUsed + " Shortage: " + transferFromWithReferenceShortage3);
var exactFee = web3.toBigNumber(transferFromWithReference3.gasUsed - transferFromWithReferenceShortage3).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
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
var correctEstimateFee = web3.toBigNumber(proxyfee.transferFromWithReference.estimateGas(acc(), acc(1), 100, "The invoice #123332", {from: acc(1), gasPrice: gasPrice})).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call()).ceil();
console.log(correctEstimateFee.toNumber() > 0);
console.log(proxyfee.transferFromWithReference.call(acc(), acc(1), 100, "The invoice #123332", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReference4 = web3.eth.getTransactionReceipt(proxyfee.transferFromWithReference(acc(), acc(1), 100, "The invoice #123332", {from: acc(1), gasPrice: gasPrice}));
var transferFromWithReferenceShortage4 = balance.sub(web3.eth.getBalance(acc(1))).div(gasPrice).toNumber();
console.log(transferFromWithReferenceShortage4 <= 0);
console.log("Gas used for transferFromWithReference 3: " + transferFromWithReference4.gasUsed + " Shortage: " + transferFromWithReferenceShortage4);
var exactFee = web3.toBigNumber(transferFromWithReference4.gasUsed - transferFromWithReferenceShortage4).mul(gasPrice).div(proxyfee.tokenPriceInWeiSell.call());
var actualFee = web3.toBigNumber(transferFromWithReference4.logs[3].data);
console.log(correctEstimateFee.gte(actualFee));
console.log(actualFee.gte(exactFee));
console.log("Estimate: " + correctEstimateFee.toNumber() + " exact: " + exactFee.toNumber() + " actual: " + actualFee.toNumber());
console.log(proxyfee.balanceOf.call(feeAddress).eq(feeBalance.add(actualFee)));
console.log(proxyfee.balanceOf.call(acc(1)).eq(tokenBalance.add(100)));
console.log(proxyfee.balanceOf.call(acc()).add(100).add(actualFee).eq(tokenBalanceFrom));


var amount = 1000;
console.log(etok.approve.call(proxyfee.address, amount, symbol, {from: acc(), gasPrice: gasPrice}));
etok.approve(proxyfee.address, approve, symbol, {from: acc(), gasPrice: gasPrice});
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
var exchangeBalance = proxyfee.balanceOf(exchangeAddress);
var treasuryBalance = web3.eth.getBalance(treasury.address);
console.log(proxyfee.buy.call(acc(), {from: acc(), gasPrice: gasPrice, value: price}));
var buy1 = web3.eth.getTransactionReceipt(proxyfee.buy(acc(), {from: acc(), gasPrice: gasPrice, value: price}));
console.log("Gas used for buy 1: " + buy1.gasUsed);
var actualResult = web3.toBigNumber(buy1.logs[buy1.logs.length-1].data.substr(0, 66));
console.log(actualResult.eq(amount));
console.log("Estimate: " + amount + " actual: " + actualResult.toNumber());
console.log(proxyfee.balanceOf.call(exchangeAddress).eq(exchangeBalance.sub(amount)));
console.log(proxyfee.balanceOf.call(acc()).eq(tokenBalance.add(amount)));
console.log(web3.eth.getBalance(acc()).eq(balance.sub(price).sub(gasPrice.mul(buy1.gasUsed))));
console.log(web3.eth.getBalance(treasury.address).eq(treasuryBalance.add(price)));


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
safeTransactions(
  safeTransactionFunction(ambi.addNode, ["antonT", "0xd94440b42e32a98da08dba34884e8c35485ba551"], address),
  safeTransactionFunction(ambi.addNode, ["antonS", "0x1b0598ec7e538deae709e8e9116bbdc43bc971dc"], address, {waitReceipt: true}),
  safeTransactionFunction(ambi.setRelation, ["access1", "signer", "antonT"], address),
  safeTransactionFunction(ambi.setRelation, ["access1", "signer", "antonS"], address, {waitReceipt: true})
);