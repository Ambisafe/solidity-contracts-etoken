contract('WeiToken', {reset_state: true}, function(accounts) {
  var eventsHelper = require('../truffle-helpers/eventsHelper.js');
  var testHelper = require('../truffle-helpers/testHelper.js');
  var bytes32 = testHelper.bytes32;
  var sha3 = testHelper.sha3;

  var multiAsset;
  var userContract;
  var asset;
  var icap;
  var router;
  var SYMBOL = 'ETH';
  var startingBalance;
  var startingBalance1;
  var startingBalance2;
  var startingBalance3;
  var getBalance;
  var getTokenBalance;
  var send;
  var icap2;
  var icap3;

  before('setup', function(done) {
    multiAsset = MultiAsset.deployed();
    asset = WeiToken.deployed();
    icap = RegistryICAP.deployed();
    router = RouterICAP.deployed();
    userContract = UserContract.deployed();
    getBalance = web3.eth.getBalance;
    getTokenBalance = asset.balanceOf;
    var stackDepthLib = StackDepthLib.deployed();
    send = function(to, value, from) {
      return web3.eth.sendTransaction({to: to, value: value, from: from || accounts[0]});
    }
    userContract.init(multiAsset.address).then(function() {
      userContract = MultiAsset.at(userContract.address);
      return multiAsset.setupRegistryICAP(icap.address);
    }).then(function() {
      return multiAsset.setupStackDepthLib(stackDepthLib.address);
    }).then(function() {
      return icap.registerAsset(SYMBOL, SYMBOL);
    }).then(function() {
      icap2 = web3.eth.iban.fromBban(SYMBOL + 'ACC2' + '123456789').toString();
      return icap.registerInstitution('ACC2', accounts[2]);
    }).then(function() {
      return icap.registerInstitutionAsset(SYMBOL, 'ACC2', accounts[2], {from: accounts[2]});
    }).then(function() {
      icap3 = web3.eth.iban.fromBban(SYMBOL + 'ACC3' + '123456789').toString();
      return icap.registerInstitution('ACC3', accounts[3]);
    }).then(function() {
      return icap.registerInstitutionAsset(SYMBOL, 'ACC3', accounts[3], {from: accounts[3]});
    }).then(function() {
      return router.setupRegistryICAP(icap.address);
    }).then(function() {
      return asset.setupRouterICAP(router.address);
    }).then(function() {
      return asset.init(multiAsset.address, SYMBOL);
    }).then(function() {
      return userContract.approve(asset.address, '99999999999999999999999999999999', SYMBOL);
    }).then(function() {
      userContract = UserContract.at(userContract.address);
      return userContract.init(asset.address);
    }).then(function() {
      userContract = WeiToken.at(userContract.address);
      return getBalance(accounts[0]);
    }).then(function(balance) {
      startingBalance = balance;
      return getBalance(accounts[1]);
    }).then(function(balance) {
      startingBalance1 = balance;
      return getBalance(accounts[2]);
    }).then(function(balance) {
      startingBalance2 = balance;
      return getBalance(accounts[3]);
    }).then(function(balance) {
      startingBalance3 = balance;
      done();
    }).catch(done);
  });

  it('should not be possible to deposit to asset address', function(done) {
    var value = 132000000;
    asset.deposit(asset.address, {value: value}).then(function() {
      return getTokenBalance(accounts[0]);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getBalance(accounts[0]);
    }).then(function(balance) {
      assert.isTrue(balance.gt(startingBalance.sub(value)));
      return getBalance(asset.address);
    }).then(function(balance) {
      assert.isTrue(balance.eq(0));
      return getTokenBalance(asset.address);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
    }).then(done).catch(done);
  });

  it('should be possible to deposit', function(done) {
    var value = 132000000;
    asset.deposit(accounts[0], {value: value}).then(function() {
      return getTokenBalance(accounts[0]);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, value);
      return getBalance(accounts[0]);
    }).then(function(balance) {
      assert.isTrue(balance.lt(startingBalance.sub(value)));
      return getBalance(asset.address);
    }).then(function(balance) {
      assert.isTrue(balance.eq(value));
    }).then(done).catch(done);
  });

  it('should auto convert to ether', function(done) {
    var value = 132000000;
    var receiver = accounts[1];
    asset.setAutoDeposit(true, {from: receiver}).then(function() {
      return asset.deposit(accounts[0], {value: value});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      startingBalance1 = balance;
      return asset.transfer(receiver, value);
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      assert.isTrue(balance.eq(startingBalance1.add(value)));
      return getBalance(accounts[0]);
    }).then(function(balance) {
      assert.isTrue(balance.lt(startingBalance.sub(value)));
      return getTokenBalance(accounts[0]);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
    }).then(done).catch(done);
  });

  it('should auto deposit on transfer', function(done) {
    var value = 132000000;
    var receiver = accounts[1];
    asset.transfer(receiver, value, {value: value}).then(function() {
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.isTrue(tokenBalance.eq(value));
      return getBalance(accounts[0]);
    }).then(function(balance) {
      assert.isTrue(balance.lt(startingBalance.sub(value)));
      return getTokenBalance(accounts[0]);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getBalance(asset.address);
    }).then(function(balance) {
      assert.isTrue(balance.eq(value));
    }).then(done).catch(done);
  });

  it('should auto deposit and auto convert to ether on transfer', function(done) {
    var value = 132000000;
    var receiver = accounts[1];
    asset.setAutoDeposit(true, {from: receiver}).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      startingBalance1 = balance;
      return asset.transfer(receiver, value, {value: value});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      assert.isTrue(balance.eq(startingBalance1.add(value)));
      return getBalance(accounts[0]);
    }).then(function(balance) {
      assert.isTrue(balance.lt(startingBalance.sub(value)));
      return getTokenBalance(accounts[0]);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
    }).then(done).catch(done);
  });

  it('should auto convert to ether on transfer from', function(done) {
    var value = 132000000;
    var receiver = accounts[1];
    var spender = accounts[2];
    asset.setAutoDeposit(true, {from: receiver}).then(function() {
      return asset.deposit(accounts[0], {value: value});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      startingBalance1 = balance;
      return asset.approve(spender, value);
    }).then(function() {
      return asset.transferFrom(accounts[0], receiver, value, {from: spender});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      assert.isTrue(balance.eq(startingBalance1.add(value)));
      return getBalance(accounts[0]);
    }).then(function(balance) {
      assert.isTrue(balance.lt(startingBalance.sub(value)));
      return getTokenBalance(accounts[0]);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
    }).then(done).catch(done);
  });

  it('should auto convert to ether on transfer to ICAP', function(done) {
    var value = 132000000;
    var receiver = accounts[2];
    asset.setAutoDeposit(true, {from: receiver}).then(function() {
      return asset.deposit(accounts[0], {value: value});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      startingBalance1 = balance;
      return asset.transferToICAP(icap2, value);
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      assert.isTrue(balance.eq(startingBalance1.add(value)));
      return getBalance(accounts[0]);
    }).then(function(balance) {
      assert.isTrue(balance.lt(startingBalance.sub(value)));
      return getTokenBalance(accounts[0]);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
    }).then(done).catch(done);
  });

  it('should auto deposit on transfer to ICAP', function(done) {
    var value = 132000000;
    var receiver = accounts[2];
    asset.transferToICAP(icap2, value, {value: value}).then(function() {
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.isTrue(tokenBalance.eq(value));
      return getBalance(accounts[0]);
    }).then(function(balance) {
      assert.isTrue(balance.lt(startingBalance.sub(value)));
      return getTokenBalance(accounts[0]);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getBalance(asset.address);
    }).then(function(balance) {
      assert.isTrue(balance.eq(value));
    }).then(done).catch(done);
  });

  it('should auto deposit and auto convert to ether on transfer to ICAP', function(done) {
    var value = 132000000;
    var receiver = accounts[2];
    asset.setAutoDeposit(true, {from: receiver}).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      startingBalance1 = balance;
      return asset.transferToICAP(icap2, value, {value: value});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      assert.isTrue(balance.eq(startingBalance1.add(value)));
      return getBalance(accounts[0]);
    }).then(function(balance) {
      assert.isTrue(balance.lt(startingBalance.sub(value)));
      return getTokenBalance(accounts[0]);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
    }).then(done).catch(done);
  });

  it('should auto convert to ether on transfer from to ICAP', function(done) {
    var value = 132000000;
    var receiver = accounts[2];
    var spender = accounts[3];
    asset.setAutoDeposit(true, {from: receiver}).then(function() {
      return asset.deposit(accounts[0], {value: value});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      startingBalance1 = balance;
      return asset.approve(spender, value);
    }).then(function() {
      return asset.transferFromToICAP(accounts[0], icap2, value, {from: spender});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      assert.isTrue(balance.eq(startingBalance1.add(value)));
      return getBalance(accounts[0]);
    }).then(function(balance) {
      assert.isTrue(balance.lt(startingBalance.sub(value)));
      return getTokenBalance(accounts[0]);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
    }).then(done).catch(done);
  });

  it('should return value on transfer from', function(done) {
    var value = 132000000;
    var returnValue = 1000000;
    var receiver = accounts[1];
    var spender = accounts[2];
    asset.setAutoDeposit(true, {from: receiver}).then(function() {
      return asset.deposit(accounts[0], {value: value});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      startingBalance1 = balance;
      return asset.approve(spender, value);
    }).then(function() {
      return asset.transferFrom(accounts[0], receiver, value, {from: spender, value: returnValue});
    }).then(function() {
      return getBalance(spender);
    }).then(function(balance) {
      assert.isTrue(balance.gt(startingBalance2.sub(returnValue)));
      return getBalance(asset.address);
    }).then(function(balance) {
      assert.equal(balance, 0);
      return getBalance(receiver);
    }).then(function(balance) {
      assert.isTrue(balance.eq(startingBalance1.add(value)));
      return getBalance(accounts[0]);
    }).then(function(balance) {
      assert.isTrue(balance.lt(startingBalance.sub(value)));
      return getTokenBalance(accounts[0]);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
    }).then(done).catch(done);
  });

  it('should return value on transfer from to ICAP', function(done) {
    var value = 132000000;
    var returnValue = 1000000;
    var receiver = accounts[2];
    var spender = accounts[3];
    asset.setAutoDeposit(true, {from: receiver}).then(function() {
      return asset.deposit(accounts[0], {value: value});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      startingBalance1 = balance;
      return asset.approve(spender, value);
    }).then(function() {
      return asset.transferFromToICAP(accounts[0], icap2, value, {from: spender, value: returnValue});
    }).then(function() {
      return getBalance(spender);
    }).then(function(balance) {
      assert.isTrue(balance.gt(startingBalance3.sub(returnValue)));
      return getBalance(asset.address);
    }).then(function(balance) {
      assert.equal(balance, 0);
      return getBalance(receiver);
    }).then(function(balance) {
      assert.isTrue(balance.eq(startingBalance1.add(value)));
      return getBalance(accounts[0]);
    }).then(function(balance) {
      assert.isTrue(balance.lt(startingBalance.sub(value)));
      return getTokenBalance(accounts[0]);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
    }).then(done).catch(done);
  });





  it('should return value on transfer from from a contract', function(done) {
    var value = 132000000;
    var returnValue = 1000000;
    var receiver = accounts[1];
    var spender = userContract.address;
    asset.setAutoDeposit(true, {from: receiver}).then(function() {
      return asset.deposit(accounts[0], {value: value});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      startingBalance1 = balance;
      return asset.approve(spender, value);
    }).then(function() {
      return userContract.transferFrom(accounts[0], receiver, value, {value: returnValue});
    }).then(function() {
      return getBalance(spender);
    }).then(function(balance) {
      assert.isTrue(balance.eq(returnValue));
      return getBalance(asset.address);
    }).then(function(balance) {
      assert.isTrue(balance.eq(value));
      return getBalance(receiver);
    }).then(function(balance) {
      assert.isTrue(balance.eq(startingBalance1));
      return getTokenBalance(accounts[0]);
    }).then(function(tokenBalance) {
      assert.isTrue(tokenBalance.eq(value));
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
    }).then(done).catch(done);
  });

  it('should be possible to deposit from a contract', function(done) {
    var value = 132000000;
    var sender = userContract.address;
    userContract.deposit(sender, {value: value}).then(function() {
      return getTokenBalance(sender);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, value);
      return getBalance(sender);
    }).then(function(balance) {
      assert.equal(balance, 0);
      return getBalance(asset.address);
    }).then(function(balance) {
      assert.isTrue(balance.eq(value));
    }).then(done).catch(done);
  });

  it('should auto convert to ether from a contract', function(done) {
    var value = 132000000;
    var receiver = accounts[1];
    var sender = userContract.address;
    asset.setAutoDeposit(true, {from: receiver}).then(function() {
      return userContract.deposit(sender, {value: value});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      startingBalance1 = balance;
      return userContract.transfer(receiver, value);
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      assert.isTrue(balance.eq(startingBalance1.add(value)));
      return getBalance(sender);
    }).then(function(balance) {
      assert.equal(balance, 0);
      return getTokenBalance(sender);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
    }).then(done).catch(done);
  });

  it('should auto deposit on transfer from a contract', function(done) {
    var value = 132000000;
    var receiver = accounts[1];
    var sender = userContract.address;
    userContract.transfer(receiver, value, {value: value}).then(function() {
      return getTokenBalance(receiver);
    }).then(function(balance) {
      assert.isTrue(balance.eq(value));
      return getBalance(sender);
    }).then(function(balance) {
      assert.equal(balance, 0);
      return getTokenBalance(sender);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getBalance(asset.address);
    }).then(function(balance) {
      assert.isTrue(balance.eq(value));
    }).then(done).catch(done);
  });

  it('should auto deposit and auto convert to ether on transfer from a contract', function(done) {
    var value = 132000000;
    var receiver = accounts[1];
    var sender = userContract.address;
    asset.setAutoDeposit(true, {from: receiver}).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      startingBalance1 = balance;
      return userContract.transfer(receiver, value, {value: value});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      assert.isTrue(balance.eq(startingBalance1.add(value)));
      return getBalance(sender);
    }).then(function(balance) {
      assert.equal(balance, 0);
      return getTokenBalance(sender);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
    }).then(done).catch(done);
  });

  it('should auto convert to ether on transfer to ICAP from a contract', function(done) {
    var value = 132000000;
    var receiver = accounts[2];
    var sender = userContract.address;
    asset.setAutoDeposit(true, {from: receiver}).then(function() {
      return userContract.deposit(sender, {value: value});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      startingBalance1 = balance;
      return userContract.transferToICAP(icap2, value);
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      assert.isTrue(balance.eq(startingBalance1.add(value)));
      return getBalance(sender);
    }).then(function(balance) {
      assert.equal(balance, 0);
      return getTokenBalance(sender);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
    }).then(done).catch(done);
  });

  it('should auto deposit on transfer to ICAP from a contract', function(done) {
    var value = 132000000;
    var receiver = accounts[2];
    var sender = userContract.address;
    userContract.transferToICAP(icap2, value, {value: value}).then(function() {
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.isTrue(tokenBalance.eq(value));
      return getBalance(sender);
    }).then(function(balance) {
      assert.equal(balance, 0);
      return getTokenBalance(sender);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getBalance(asset.address);
    }).then(function(balance) {
      assert.isTrue(balance.eq(value));
    }).then(done).catch(done);
  });

  it('should auto deposit and auto convert to ether on transfer to ICAP from a contract', function(done) {
    var value = 132000000;
    var receiver = accounts[2];
    var sender = userContract.address;
    asset.setAutoDeposit(true, {from: receiver}).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      startingBalance1 = balance;
      return userContract.transferToICAP(icap2, value, {value: value});
    }).then(function() {
      return getBalance(receiver);
    }).then(function(balance) {
      assert.isTrue(balance.eq(startingBalance1.add(value)));
      return getBalance(sender);
    }).then(function(balance) {
      assert.equal(balance, 0);
      return getTokenBalance(sender);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
      return getTokenBalance(receiver);
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance, 0);
    }).then(done).catch(done);
  });
});