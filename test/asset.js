contract('Asset', {reset_state: true}, function(accounts) {
  var eventsHelper = require('../truffle-helpers/eventsHelper.js');
  var testHelper = require('../truffle-helpers/testHelper.js');
  var bytes32 = testHelper.bytes32;
  var sha3 = testHelper.sha3;
  var stringEncode = testHelper.stringEncode;

  var UINT_256_MINUS_3 = '1.15792089237316195423570985008687907853269984665640564039457584007913129639933e+77';
  var UINT_256_MINUS_2 = '1.15792089237316195423570985008687907853269984665640564039457584007913129639934e+77';
  var UINT_256_MINUS_1 = '1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77';
  var UINT_256 = '1.15792089237316195423570985008687907853269984665640564039457584007913129639936e+77';
  var UINT_255_MINUS_1 = '5.7896044618658097711785492504343953926634992332820282019728792003956564819967e+76';
  var UINT_255 = '5.7896044618658097711785492504343953926634992332820282019728792003956564819968e+76';

  var BYTES_32 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
  var BITS_257 = '0x10000000000000000000000000000000000000000000000000000000000000000';

  var SYMBOL = bytes32(10);
  var SYMBOL2 = bytes32(1000);
  var NAME = 'Test Name';
  var DESCRIPTION = 'Test Description';
  var VALUE = 1001;
  var VALUE2 = 30000;
  var BASE_UNIT = 2;
  var IS_REISSUABLE = false;

  var Features = { Issue: 0, TransferWithReference: 1, Revoke: 2, ChangeOwnership: 3, Allowances: 4 };

  var multiAsset;
  var multiAssetAbi;
  var asset;

  before('setup others', function(done) {
    multiAsset = MultiAsset.deployed();
    asset = Asset.deployed();
    multiAssetAbi = web3.eth.contract(multiAsset.abi).at(0x0);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.issueAsset(SYMBOL2, VALUE2, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      return asset.init(multiAsset.address, SYMBOL);
    }).then(function() {
      done();
    }).catch(done);
  });

  it('should be possible to get total supply', function(done) {
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.totalSupply.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to get balance for holder', function(done) {
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.balanceOf.call(accounts[0]);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to get total supply if not allowed', function(done) {
    multiAsset.setProxy(asset.address, true, SYMBOL2).then(function() {
      return asset.totalSupply.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to get balance if not allowed', function(done) {
    multiAsset.setProxy(asset.address, true, SYMBOL2).then(function() {
      return asset.balanceOf.call(accounts[0]);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not emit transfer event from not base', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var watcher = asset.Transfer();
    multiAsset.setProxy(asset.address, true, SYMBOL2).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL2);
    }).then(function() {
      eventsHelper.setupEvents(asset);
      return asset.emitTransfer(owner, nonOwner, 100, {from: nonOwner});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
    }).then(done).catch(done);
  });
  it('should not emit approve event from not base', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var watcher = asset.Transfer();
    multiAsset.setProxy(asset.address, true, SYMBOL2).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL2);
    }).then(function() {
      eventsHelper.setupEvents(asset);
      return asset.approve(owner, nonOwner, 100, {from: nonOwner});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer if not allowed', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var watcher = asset.Transfer();
    multiAsset.setProxy(asset.address, true, SYMBOL2).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL2);
    }).then(function() {
      eventsHelper.setupEvents(asset);
      return asset.transfer(nonOwner, 100);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer amount 1 with balance 0', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var amount = 1;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.transfer(nonOwner, VALUE);
    }).then(function() {
      return asset.transfer(nonOwner, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer amount 2 with balance 1', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var value = 1;
    var amount = 2;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.transfer(nonOwner, VALUE - value);
    }).then(function() {
      return asset.transfer(nonOwner, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - value);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer amount 0', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var amount = 0;
    var watcher = asset.Transfer();
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL);
    }).then(function() {
      eventsHelper.setupEvents(asset);
      return asset.transfer(nonOwner, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer to oneself', function(done) {
    var owner = accounts[0];
    var amount = 100;
    var watcher = asset.Transfer();
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL);
    }).then(function() {
      eventsHelper.setupEvents(multiAsset);
      return asset.transfer(owner, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount 1 to existing holder with 0 balance', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.transfer(holder2, VALUE);
    }).then(function() {
      return asset.transfer(holder, amount, {from: holder2});
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount 1 to missing holder', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.transfer(holder2, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount 1 to holder with non-zero balance', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var balance2 = 100;
    var amount = 1;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.transfer(holder2, balance2);
    }).then(function() {
      return asset.transfer(holder2, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance2 + amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - balance2 - amount);
    }).then(done).catch(done);
  });
  it('should checkSigned on transfer', function(done) {
    var checks = 0;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      checks = result.toNumber();
      return asset.transfer(accounts[1], 10);
    }).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), checks + 1);
      return multiAsset.lastOperation.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), sha3(multiAssetAbi.proxyTransferWithReference.getData(accounts[1], 10, SYMBOL, ""), bytes32(1)));
    }).then(done).catch(done);
  });
  it('should keep transfers separated between assets', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 100;
    var watcher;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL);
    }).then(function() {
      eventsHelper.setupEvents(asset);
      watcher = asset.Transfer();
      return asset.transfer(holder2, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.to.valueOf(), holder2);
      assert.equal(events[0].args.value.valueOf(), amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(holder, SYMBOL2);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE2);
      return multiAsset.balanceOf.call(holder2, SYMBOL2);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should emit transfer event from base', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 100;
    var watcher;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL);
    }).then(function() {
      eventsHelper.setupEvents(asset);
      watcher = asset.Transfer();
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.to.valueOf(), holder2);
      assert.equal(events[0].args.value.valueOf(), amount);
    }).then(done).catch(done);
  });
  it('should work with msg.sender');

  it('should not be possible to set allowance if not allowed', function(done) {
    var owner = accounts[0];
    var spender = accounts[1];
    var watcher;
    eventsHelper.setupEvents(multiAsset);
    watcher = asset.Approve();
    multiAsset.setEventsProxy(asset.address, SYMBOL2).then(function() {
      return asset.approve(spender, 100);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.allowance.call(owner, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to set allowance for oneself', function(done) {
    var owner = accounts[0];
    var watcher;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL);
    }).then(function() {
      eventsHelper.setupEvents(asset);
      watcher = asset.Approve();
      return asset.approve(owner, 100);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.allowance.call(owner, owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance from missing holder to missing holder', function(done) {
    var holder = accounts[1];
    var spender = accounts[2];
    var value = 100;
    var watcher;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL);
    }).then(function() {
      eventsHelper.setupEvents(asset);
      watcher = asset.Approve();
      return asset.approve(spender, value, {from: holder});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.spender.valueOf(), spender);
      assert.equal(events[0].args.value.valueOf(), value);
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should emit allowance from base', function(done) {
    var holder = accounts[1];
    var spender = accounts[2];
    var value = 100;
    var watcher;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL);
    }).then(function() {
      eventsHelper.setupEvents(asset);
      watcher = asset.Approve();
      return multiAsset.approve(spender, value, SYMBOL, {from: holder});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.spender.valueOf(), spender);
      assert.equal(events[0].args.value.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance from missing holder to existing holder', function(done) {
    var holder = accounts[1];
    var spender = accounts[0];
    var value = 100;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, value, {from: holder});
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance from existing holder to missing holder', function(done) {
    var holder = accounts[0];
    var spender = accounts[2];
    var value = 100;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, value, {from: holder});
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance from existing holder to existing holder', function(done) {
    var holder = accounts[0];
    var spender = accounts[2];
    var value = 100;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.transfer(spender, 1, {from: holder});
    }).then(function() {
      return asset.approve(spender, value, {from: holder});
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance value 0', function(done) {
    // Covered by 'should be possible to override allowance value with 0 value'.
    done();
  });
  it('should be possible to set allowance with (2**256 - 1) value', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = UINT_256_MINUS_1;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance value less then balance', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 1;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance value equal to balance', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = VALUE;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance value more then balance', function(done) {
    // Covered by 'should be possible to set allowance with (2**256 - 1) value'.
    done();
  });
  it('should be possible to override allowance value with 0 value', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 0;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, 100);
    }).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to override allowance value with non 0 value', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 1000;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, 100);
    }).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not affect balance when setting allowance', function(done) {
    var holder = accounts[0];
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(accounts[1], 100);
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance', function(done) {
    // Covered by other tests above.
    done();
  });

  it('should not be possible to do allowance transfer if not allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var watcher;
    multiAsset.approve(spender, 50, SYMBOL).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL);
    }).then(function() {
      eventsHelper.setupEvents(asset);
      watcher = asset.Transfer();
      return asset.transferFrom(holder, spender, 50, {from: spender});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer by not allowed existing spender, from existing holder', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 100;
    var expectedSpenderBalance = 100;
    var expectedHolderBalance = VALUE - value;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.transfer(spender, value);
    }).then(function() {
      return asset.transferFrom(holder, spender, 50, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer by not allowed existing spender, from missing holder', function(done) {
    var holder = accounts[2];
    var spender = accounts[1];
    var value = 100;
    var expectedSpenderBalance = 100;
    var expectedHolderBalance = 0;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.transfer(spender, value);
    }).then(function() {
      return asset.transferFrom(holder, spender, 50, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer by not allowed missing spender, from existing holder', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var expectedSpenderBalance = 0;
    var expectedHolderBalance = VALUE;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.transferFrom(holder, spender, 50, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer by not allowed missing spender, from missing holder', function(done) {
    var holder = accounts[2];
    var spender = accounts[1];
    var expectedSpenderBalance = 0;
    var expectedHolderBalance = 0;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.transferFrom(holder, spender, 50, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer from and to the same holder', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var watcher;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL);
    }).then(function() {
      return asset.approve(spender, 50);
    }).then(function() {
      eventsHelper.setupEvents(multiAsset);
      watcher = asset.Transfer();
      return asset.transferFrom(holder, holder, 50, {from: spender});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it.skip('should not be possible to do allowance transfer from oneself', function(done) {
    var holder = accounts[0];
    var receiver = accounts[1];
    var watcher;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL);
    }).then(function() {
      return asset.approve(holder, 50);
    }).then(function() {
      eventsHelper.setupEvents(multiAsset);
      watcher = asset.Transfer();
      return asset.transferFrom(holder, receiver, 50);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(receiver, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer with 0 value', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 0;
    var resultValue = 0;
    var watcher;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL);
    }).then(function() {
      return asset.approve(spender, 100);
    }).then(function() {
      eventsHelper.setupEvents(multiAsset);
      watcher = asset.Transfer();
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer with value less than balance, more than allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = 999;
    var allowed = 998;
    var resultValue = 0;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, allowed);
    }).then(function() {
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer with value equal to balance, more than allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = VALUE;
    var allowed = 999;
    var resultValue = 0;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, allowed);
    }).then(function() {
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer with value more than balance, less than allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = VALUE + 1;
    var allowed = value + 1;
    var resultValue = 0;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, allowed);
    }).then(function() {
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer with value less than balance, more than allowed after another tranfer', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var anotherValue = 10;
    var value = VALUE - anotherValue - 1;
    var allowed = value - 1;
    var expectedHolderBalance = balance - anotherValue;
    var resultValue = anotherValue;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, allowed);
    }).then(function() {
      return asset.transferFrom(holder, spender, anotherValue, {from: spender});
    }).then(function() {
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer when allowed for another symbol', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = 200;
    var allowed = 1000;
    var resultValue = 0;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.approve(spender, allowed, SYMBOL2);
    }).then(function() {
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return multiAsset.balanceOf.call(holder, SYMBOL2);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE2);
      return multiAsset.balanceOf.call(spender, SYMBOL2);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer by allowed existing spender', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var existValue = 100;
    var value = 300;
    var expectedHolderBalance = VALUE - existValue - value;
    var expectedSpenderBalance = existValue + value;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.transfer(spender, existValue);
    }).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer by allowed missing spender', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 300;
    var expectedHolderBalance = VALUE - value;
    var expectedSpenderBalance = value;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer to oneself', function(done) {
    // Covered by 'should be possible to do allowance transfer by allowed existing spender'.
    done();
  });
  it('should be possible to do allowance transfer to existing holder', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var receiver = accounts[2];
    var existValue = 100;
    var value = 300;
    var expectedHolderBalance = VALUE - existValue - value;
    var expectedReceiverBalance = existValue + value;
    var watcher;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL);
    }).then(function() {
      return asset.transfer(receiver, existValue);
    }).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      eventsHelper.setupEvents(asset);
      watcher = asset.Transfer();
      return asset.transferFrom(holder, receiver, value, {from: spender});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.to.valueOf(), receiver);
      assert.equal(events[0].args.value.valueOf(), value);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(receiver, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedReceiverBalance);
    }).then(done).catch(done);
  });
  it('should emit allowance transfer event from base', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var receiver = accounts[2];
    var existValue = 100;
    var value = 300;
    var watcher;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setEventsProxy(asset.address, SYMBOL);
    }).then(function() {
      return asset.transfer(receiver, existValue);
    }).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      eventsHelper.setupEvents(asset);
      watcher = asset.Transfer();
      return multiAsset.transferFrom(holder, receiver, value, SYMBOL, {from: spender});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.to.valueOf(), receiver);
      assert.equal(events[0].args.value.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer to missing holder', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var receiver = accounts[2];
    var value = 300;
    var expectedHolderBalance = VALUE - value;
    var expectedReceiverBalance = value;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.transferFrom(holder, receiver, value, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(receiver, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedReceiverBalance);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer with value less than balance and less than allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = balance - 1;
    var allowed = value + 1;
    var expectedHolderBalance = balance - value;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, allowed);
    }).then(function() {
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer with value less than balance and equal to allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = balance - 1;
    var allowed = value;
    var expectedHolderBalance = balance - value;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, allowed);
    }).then(function() {
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer with value equal to balance and less than allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = balance;
    var allowed = value + 1;
    var expectedHolderBalance = balance - value;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, allowed);
    }).then(function() {
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer with value equal to balance and equal to allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = balance;
    var allowed = value;
    var expectedHolderBalance = balance - value;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, allowed);
    }).then(function() {
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer with value less than balance and less than allowed after another transfer', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var anotherValue = 1;
    var value = balance - anotherValue - 1;
    var allowed = value + 1;
    var expectedSpenderBalance = anotherValue + value;
    var expectedHolderBalance = balance - anotherValue - value;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, allowed);
    }).then(function() {
      return asset.transferFrom(holder, spender, anotherValue, {from: spender});
    }).then(function() {
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer with value less than balance and equal to allowed after another transfer', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var anotherValue = 1;
    var value = balance - anotherValue - 1;
    var allowed = value + anotherValue;
    var expectedSpenderBalance = anotherValue + value;
    var expectedHolderBalance = balance - anotherValue - value;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, allowed);
    }).then(function() {
      return asset.transferFrom(holder, spender, anotherValue, {from: spender});
    }).then(function() {
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
    }).then(done).catch(done);
  });
  it('should checkSigned approve and allowance transfer', function(done) {
    var checks = 0;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      checks = result.toNumber();
      return asset.approve(accounts[1], 100);
    }).then(function() {
      return asset.transferFrom(accounts[0], accounts[1], 10, {from: accounts[1]});
    }).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), checks + 2);
      return multiAsset.lastOperation.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), sha3(multiAssetAbi.proxyTransferFromWithReference.getData(accounts[0], accounts[1], 10, SYMBOL, ""), bytes32(2)));
    }).then(done).catch(done);
  });
  it('should checkSigned on approve', function(done) {
    var checks = 0;   
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      checks = result.toNumber();
      return asset.approve(accounts[1], 100);
    }).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), checks + 1);
      return multiAsset.lastOperation.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), sha3(multiAssetAbi.proxyApprove.getData(accounts[1], 100, SYMBOL, accounts[0]), bytes32(1)));
    }).then(done).catch(done);
  });

  it('should return allowance when not allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 100;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should return 0 allowance for existing owner and not allowed existing spender', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.transfer(spender, 100);
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should return 0 allowance for existing owner and not allowed missing spender', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should return 0 allowance for missing owner and existing spender', function(done) {
    var holder = accounts[1];
    var spender = accounts[0];
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should return 0 allowance for missing owner and missing spender', function(done) {
    var holder = accounts[1];
    var spender = accounts[2];
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should return 0 allowance for existing oneself', function(done) {
    var holder = accounts[0];
    var spender = holder;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should return 0 allowance for missing oneself', function(done) {
    var holder = accounts[1];
    var spender = holder;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should respect holder when telling allowance', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var spender = accounts[2];
    var value = 100;
    var value2 = 200;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.approve(spender, value2, {from: holder2});
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return asset.allowance.call(holder2, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2);
    }).then(done).catch(done);
  });
  it('should respect spender when telling allowance', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var spender2 = accounts[2];
    var value = 100;
    var value2 = 200;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.approve(spender2, value2);
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return asset.allowance.call(holder, spender2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2);
    }).then(done).catch(done);
  });
  it('should be possible to check allowance of existing owner and allowed existing spender', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 300;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.transfer(spender, 100);
    }).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to check allowance of existing owner and allowed missing spender', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 300;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should return 0 allowance after another transfer', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 300;
    var resultValue = 0;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should return 1 allowance after another transfer', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var receiver = accounts[2];
    var value = 300;
    var transfer = 299;
    var resultValue = 1;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return asset.approve(spender, value);
    }).then(function() {
      return asset.transferFrom(holder, receiver, transfer, {from: spender});
    }).then(function() {
      return asset.allowance.call(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });

  it('should checkSigned on user asset above user', function(done) {
    var cosignerUserAsset = Cosigner2.deployed();
    var cosignerUser = Cosigner3.deployed();
    var cosignerUserAssetChecks = 0;
    var cosignerUserChecks = 0;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setCosignerAddress(cosignerUserAsset.address, SYMBOL);
    }).then(function() {
      return multiAsset.setCosignerAddressForUser(cosignerUser.address);
    }).then(function() {
      return cosignerUserAsset.signChecks.call();
    }).then(function(result) {
      cosignerUserAssetChecks = result.toNumber();
      return cosignerUser.signChecks.call();
    }).then(function(result) {
      cosignerUserChecks = result.toNumber();
      return asset.transfer(accounts[0], 10);
    }).then(function() {
      return cosignerUserAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), cosignerUserAssetChecks + 1);
      return cosignerUser.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), cosignerUserChecks);
    }).then(done).catch(done);
  });
  it('should checkSigned on user if others not set', function(done) {
    var cosignerUser = Cosigner3.deployed();
    var cosignerUserChecks = 0;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setCosignerAddressForUser(cosignerUser.address);
    }).then(function() {
      return cosignerUser.signChecks.call();
    }).then(function(result) {
      cosignerUserChecks = result.toNumber();
      return asset.transfer(accounts[0], 10);
    }).then(function() {
      return cosignerUser.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), cosignerUserChecks + 1);
    }).then(done).catch(done);
  });

  it('should be possible to disable proxy', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var balance2 = 100;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setProxy(asset.address, false, SYMBOL);
    }).then(function() {
      return asset.transfer(holder2, balance2);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should check onlyProxy for transfers', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var balance2 = 100;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setOnlyProxy(true, SYMBOL);
    }).then(function() {
      return asset.transfer(holder2, balance2);
    }).then(function() {
      return multiAsset.transfer(holder2, balance2, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance2);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - balance2);
    }).then(done).catch(done);
  });
  it('should check onlyProxy for approvals', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var allowance = 100;
    var allowane2 = 200;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setOnlyProxy(true, SYMBOL);
    }).then(function() {
      return asset.approve(holder2, allowance);
    }).then(function() {
      return multiAsset.approve(holder2, allowane2, SYMBOL);
    }).then(function() {
      return multiAsset.allowance.call(holder, holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), allowance);
    }).then(done).catch(done);
  });
  it('should be possible to disable onlyProxy', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var balance2 = 100;
    multiAsset.setProxy(asset.address, true, SYMBOL).then(function() {
      return multiAsset.setOnlyProxy(true, SYMBOL);
    }).then(function() {
      return multiAsset.setOnlyProxy(false, SYMBOL);
    }).then(function() {
      return asset.transfer(holder2, balance2);
    }).then(function() {
      return multiAsset.transfer(holder2, balance2, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance2*2);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - balance2*2);
    }).then(done).catch(done);
  });
});