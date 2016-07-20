var assetBase = require('./assetBase');

contract('AssetWithSimpleFee', {reset_state: true}, function(accounts) {
  var SYMBOL = "0x000000000000000000000000000000000000000000000000000000000000000a";
  var SYMBOL2 = "0x00000000000000000000000000000000000000000000000000000000000003e8";
  var NAME = 'Test Name';
  var DESCRIPTION = 'Test Description';
  var VALUE = 1001;
  var VALUE2 = 30000;
  var BASE_UNIT = 2;
  var IS_REISSUABLE = false;

  before('setup others', function(done) {
    this.multiAsset = MultiAsset.deployed();
    this.asset = AssetWithSimpleFee.deployed();
    this.multiAssetAbi = web3.eth.contract(this.multiAsset.abi).at(0x0);
    this.icap = RegistryICAP.deployed();
    var stackDepthLib = StackDepthLib.deployed();
    var that = this;
    this.multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return that.multiAsset.issueAsset(SYMBOL2, VALUE2, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      return that.multiAsset.setProxyConf(false, true, SYMBOL);
    }).then(function() {
      return that.multiAsset.setupStackDepthLib(stackDepthLib.address);
    }).then(function() {
      return that.multiAsset.setupRegistryICAP(that.icap.address);
    }).then(function() {
      return that.icap.registerAsset("TST", SYMBOL);
    }).then(function() {
      return that.icap.registerInstitution("XREG", accounts[2]);
    }).then(function() {
      return that.icap.registerInstitutionAsset("TST", "XREG", accounts[2], {from: accounts[2]});
    }).then(function() {
      return that.asset.init(that.multiAsset.address, SYMBOL);
    }).then(function() {
      done();
    }).catch(done);
  });

  assetBase(accounts);

  it('should call refunder on transfer', function(done) {
    var that = this;
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    var fake = Fake.deployed();
    that.multiAsset.setProxy(that.asset.address, true, SYMBOL).then(function() {
      return that.asset.setupTreasury(fake.address, web3.toWei(21, 'gwei'));
    }).then(function() {
      return that.asset.transfer(holder2, amount);
    }).then(function() {
      return fake.calls.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), 1);
    }).then(done).catch(done);
  });

  it('should call refunder on transfer with reference', function(done) {
    var that = this;
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    var fake = Fake.deployed();
    that.multiAsset.setProxy(that.asset.address, true, SYMBOL).then(function() {
      return that.asset.setupTreasury(fake.address, web3.toWei(21, 'gwei'));
    }).then(function() {
      return that.asset.transferWithReference(holder2, amount, 'test');
    }).then(function() {
      return fake.calls.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), 1);
    }).then(done).catch(done);
  });

  it('should take min fee on transfer', function(done) {
    var that = this;
    var holder = accounts[0];
    var holder2 = accounts[1];
    var feeAddress = accounts[2];
    var amount = 1;
    var feeMin = 3;
    var feePercent = 10 * 100;
    var feeMax = 6;
    var fake = Fake.deployed();
    that.multiAsset.setProxy(that.asset.address, true, SYMBOL).then(function() {
      return that.asset.approve(that.asset.address, 1000);
    }).then(function() {
      return that.asset.setupFee(feeAddress);
    }).then(function() {
      return that.asset.setFeeStructure(feeMin, feePercent, feeMax);
    }).then(function() {
      return that.asset.transfer(holder2, amount);
    }).then(function() {
      return that.asset.balanceOf(holder);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), VALUE - amount - feeMin);
      return that.asset.balanceOf(holder2);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), amount);
      return that.asset.balanceOf(feeAddress);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), feeMin);
    }).then(done).catch(done);
  });

  it('should take percent fee on transfer', function(done) {
    var that = this;
    var holder = accounts[0];
    var holder2 = accounts[1];
    var feeAddress = accounts[2];
    var amount = 40;
    var feeMin = 3;
    var feePercent = 10 * 100;
    var feeMax = 6;
    var fake = Fake.deployed();
    that.multiAsset.setProxy(that.asset.address, true, SYMBOL).then(function() {
      return that.asset.approve(that.asset.address, 1000);
    }).then(function() {
      return that.asset.setupFee(feeAddress);
    }).then(function() {
      return that.asset.setFeeStructure(feeMin, feePercent, feeMax);
    }).then(function() {
      return that.asset.transfer(holder2, amount);
    }).then(function() {
      return that.asset.balanceOf(holder);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), VALUE - amount - 4);
      return that.asset.balanceOf(holder2);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), amount);
      return that.asset.balanceOf(feeAddress);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 4);
    }).then(done).catch(done);
  });

  it('should take max fee on transfer', function(done) {
    var that = this;
    var holder = accounts[0];
    var holder2 = accounts[1];
    var feeAddress = accounts[2];
    var amount = 70;
    var feeMin = 3;
    var feePercent = 10 * 100;
    var feeMax = 6;
    var fake = Fake.deployed();
    that.multiAsset.setProxy(that.asset.address, true, SYMBOL).then(function() {
      return that.asset.approve(that.asset.address, 1000);
    }).then(function() {
      return that.asset.setupFee(feeAddress);
    }).then(function() {
      return that.asset.setFeeStructure(feeMin, feePercent, feeMax);
    }).then(function() {
      return that.asset.transfer(holder2, amount);
    }).then(function() {
      return that.asset.balanceOf(holder);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), VALUE - amount - feeMax);
      return that.asset.balanceOf(holder2);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), amount);
      return that.asset.balanceOf(feeAddress);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), feeMax);
    }).then(done).catch(done);
  });

  it('should return fee on failed transfer', function(done) {
    var that = this;
    var holder = accounts[0];
    var holder2 = accounts[1];
    var feeAddress = accounts[2];
    var amount = VALUE;
    var feeMin = 3;
    var feePercent = 10 * 100;
    var feeMax = 6;
    var fake = Fake.deployed();
    that.multiAsset.setProxy(that.asset.address, true, SYMBOL).then(function() {
      return that.asset.approve(that.asset.address, 1000);
    }).then(function() {
      return that.asset.approve(that.asset.address, 1000, {from: feeAddress});
    }).then(function() {
      return that.asset.setupFee(feeAddress);
    }).then(function() {
      return that.asset.setFeeStructure(feeMin, feePercent, feeMax);
    }).then(function() {
      return that.asset.transfer(holder2, amount);
    }).then(function() {
      return that.asset.balanceOf(holder);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), VALUE);
      return that.asset.balanceOf(holder2);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 0);
      return that.asset.balanceOf(feeAddress);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 0);
    }).then(done).catch(done);
  });

  it('should take additional min fee on transfer with reference of 101 bytes', function(done) {
    var that = this;
    var holder = accounts[0];
    var holder2 = accounts[1];
    var feeAddress = accounts[2];
    var amount = 1;
    var feeMin = 3;
    var feePercent = 10 * 100;
    var feeMax = 6;
    var fake = Fake.deployed();
    that.multiAsset.setProxy(that.asset.address, true, SYMBOL).then(function() {
      return that.asset.approve(that.asset.address, 1000);
    }).then(function() {
      return that.asset.setupFee(feeAddress);
    }).then(function() {
      return that.asset.setFeeStructure(feeMin, feePercent, feeMax);
    }).then(function() {
      return that.asset.transferWithReference(holder2, amount, "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901");
    }).then(function() {
      return that.asset.balanceOf(holder);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), VALUE - amount - feeMin*2);
      return that.asset.balanceOf(holder2);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), amount);
      return that.asset.balanceOf(feeAddress);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), feeMin*2);
    }).then(done).catch(done);
  });

  it('should not take additional min fee on transfer with reference of 100 bytes', function(done) {
    var that = this;
    var holder = accounts[0];
    var holder2 = accounts[1];
    var feeAddress = accounts[2];
    var amount = 1;
    var feeMin = 3;
    var feePercent = 10 * 100;
    var feeMax = 6;
    var fake = Fake.deployed();
    that.multiAsset.setProxy(that.asset.address, true, SYMBOL).then(function() {
      return that.asset.approve(that.asset.address, 1000);
    }).then(function() {
      return that.asset.setupFee(feeAddress);
    }).then(function() {
      return that.asset.setFeeStructure(feeMin, feePercent, feeMax);
    }).then(function() {
      return that.asset.transferWithReference(holder2, amount, "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890");
    }).then(function() {
      return that.asset.balanceOf(holder);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), VALUE - amount - feeMin);
      return that.asset.balanceOf(holder2);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), amount);
      return that.asset.balanceOf(feeAddress);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), feeMin);
    }).then(done).catch(done);
  });

  it('should take 2 additional min fee on transfer with reference of 1334 bytes', function(done) {
    var that = this;
    var holder = accounts[0];
    var holder2 = accounts[1];
    var feeAddress = accounts[2];
    var amount = 1;
    var feeMin = 3;
    var feePercent = 10 * 100;
    var feeMax = 6;
    var fake = Fake.deployed();
    that.multiAsset.setProxy(that.asset.address, true, SYMBOL).then(function() {
      return that.asset.approve(that.asset.address, 1000);
    }).then(function() {
      return that.asset.setupFee(feeAddress);
    }).then(function() {
      return that.asset.setFeeStructure(feeMin, feePercent, feeMax);
    }).then(function() {
      return that.asset.transferWithReference(holder2, amount, "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678907890123456789012345678901234567890");
    }).then(function() {
      return that.asset.balanceOf(holder);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), VALUE - amount - feeMin*3);
      return that.asset.balanceOf(holder2);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), amount);
      return that.asset.balanceOf(feeAddress);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), feeMin*3);
    }).then(done).catch(done);
  });
});