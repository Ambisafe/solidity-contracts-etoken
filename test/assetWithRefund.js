var assetBase = require('./assetBase');

contract('AssetWithRefund', {reset_state: true}, function(accounts) {
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
    this.asset = AssetWithRefund.deployed();
    this.multiAssetAbi = web3.eth.contract(this.multiAsset.abi).at(0x0);
    this.icap = RegistryICAP.deployed();
    var stackDepthLib = StackDepthLib.deployed();
    var that = this;
    this.multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return that.multiAsset.issueAsset(SYMBOL2, VALUE2, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
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
});