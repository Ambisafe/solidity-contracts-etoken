contract('MultiAsset', {reset_state: true}, function(accounts) {
  var bytes32 = function(number) {
    var zeros = '000000000000000000000000000000000000000000000000000000000000000';
    var hexNumber = number.toString(16);
    return '0x' + (zeros + hexNumber).substring(hexNumber.length - 1);
  };

  var UINT_256_MINUS_3 = '1.15792089237316195423570985008687907853269984665640564039457584007913129639933e+77';
  var UINT_256_MINUS_2 = '1.15792089237316195423570985008687907853269984665640564039457584007913129639934e+77';
  var UINT_256_MINUS_1 = '1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77';
  var UINT_256 = '1.15792089237316195423570985008687907853269984665640564039457584007913129639936e+77';
  var UINT_255_MINUS_1 = '5.7896044618658097711785492504343953926634992332820282019728792003956564819967e+76';
  var UINT_255 = '5.7896044618658097711785492504343953926634992332820282019728792003956564819968e+76';

  var BYTES_32 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
  var BITS_257 = '0x10000000000000000000000000000000000000000000000000000000000000000';

  var SYMBOL = bytes32(0);
  var NAME = 'Test Name';
  var DESCRIPTION = 'Test Description';
  var VALUE = 1001;
  var BASE_UNIT = 2;
  var IS_REISSUABLE = false;

  it('should not be possible to issue asset with existing symbol', function(done) {
    var multiAsset = MultiAsset.deployed();
    var symbol = bytes32(0);
    var value = 1001;
    var value2 = 3021;
    var name = 'Test Name';
    var name2 = '2Test Name2';
    var description = 'Test Description';
    var description2 = '2Test Description2';
    var baseUnit = 2;
    var baseUnit2 = 4;
    var isReissuable = false;
    var isReissuable2 = true;
    var watcher = multiAsset.Issue();
    multiAsset.issueAsset(symbol, value, name, description, baseUnit, isReissuable).then(function() {
      return watcher.get();
    }).then(function(events) {
      assert.equal(events.length, 1);
      return multiAsset.issueAsset(symbol, value2, name2, description2, baseUnit2, isReissuable2);
    }).then(function() {
      return watcher.get();
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.name.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), name);
      return multiAsset.totalSupply.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.description.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), description);
      return multiAsset.baseUnit.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), baseUnit);
      return multiAsset.isReissuable.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), isReissuable);
    }).then(done).catch(done);
  });
  it('should be possible to issue asset with 1 bit 0 symbol', function(done) {
    var multiAsset = MultiAsset.deployed();
    var symbol = bytes32(0);
    multiAsset.issueAsset(symbol, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.name.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), NAME);
    }).then(done).catch(done);
  });
  it('should be possible to issue asset with 1 bit 1 symbol', function(done) {
    var multiAsset = MultiAsset.deployed();
    var symbol = bytes32(1);
    multiAsset.issueAsset(symbol, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.name.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), NAME);
    }).then(done).catch(done);
  });
  it('should be possible to issue asset with 32 bytes symbol', function(done) {
    var multiAsset = MultiAsset.deployed();
    var symbol = BYTES_32;
    multiAsset.issueAsset(symbol, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.name.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), NAME);
    }).then(done).catch(done);
  });
  it.skip('should not be possible to issue asset with 257 bits symbol', function(done) {
    var multiAsset = MultiAsset.deployed();
    var symbol = BITS_257;
    multiAsset.issueAsset(symbol, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.assets.call(1);
    }).then(function() {
      done('Exception did not happen, asset created.');
    }, function() {
      done();
    });
  });
  it('should not be possible to issue fixed asset with 0 value', function(done) {
    var multiAsset = MultiAsset.deployed();
    var value = 0;
    var isReissuable = false;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.name.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), '');
    }).then(done).catch(done);
  });
  it('should be possible to issue fixed asset with 1 value', function(done) {
    var multiAsset = MultiAsset.deployed();
    var value = 1;
    var isReissuable = false;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to issue fixed asset with (2**256 - 1) value', function(done) {
    var multiAsset = MultiAsset.deployed();
    var value = UINT_256_MINUS_1;
    var isReissuable = false;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to issue fixed asset with 2**256 value', function(done) {
    var multiAsset = MultiAsset.deployed();
    var value = UINT_256;
    var isReissuable = false;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.name.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), '');
    }).then(done).catch(done);
  });
  it('should be possible to issue reissuable asset with 0 value', function(done) {
    var multiAsset = MultiAsset.deployed();
    var value = 0;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.name.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), NAME);
    }).then(done).catch(done);
  });
  it('should be possible to issue reissuable asset with 1 value', function(done) {
    var multiAsset = MultiAsset.deployed();
    var value = 1;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to issue reissuable asset with (2**256 - 1) value', function(done) {
    var multiAsset = MultiAsset.deployed();
    var value = UINT_256_MINUS_1;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to issue reissuable asset with 2**256 value', function(done) {
    var multiAsset = MultiAsset.deployed();
    var value = UINT_256;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.name.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), '');
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it.skip('should not be possible to issue asset with base unit 0', function(done) {
    var multiAsset = MultiAsset.deployed();
    var baseUnit = 0;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, baseUnit, IS_REISSUABLE).then(function() {
      return multiAsset.name.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), '');
    }).then(done).catch(done);
  });
  it('should be possible to issue asset with base unit 1', function(done) {
    var multiAsset = MultiAsset.deployed();
    var baseUnit = 1;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, baseUnit, IS_REISSUABLE).then(function() {
      return multiAsset.baseUnit.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 1);
    }).then(done).catch(done);
  });
  it('should be possible to issue asset with base unit 255', function(done) {
    var multiAsset = MultiAsset.deployed();
    var baseUnit = 255;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, baseUnit, IS_REISSUABLE).then(function() {
      return multiAsset.baseUnit.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 255);
    }).then(done).catch(done);
  });
  it.skip('should not be possible to issue asset with base unit 256', function(done) {
    var multiAsset = MultiAsset.deployed();
    var baseUnit = 256;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, baseUnit, IS_REISSUABLE).then(function() {
      return multiAsset.name.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), '');
    }).then(done).catch(done);
  });
  it('should be possible to issue asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var symbol = bytes32(0);
    var value = 1001;
    var name = 'Test Name';
    var description = 'Test Description';
    var baseUnit = 2;
    var isReissuable = false;
    var watcher = multiAsset.Issue();
    multiAsset.issueAsset(symbol, value, name, description, baseUnit, isReissuable).then(function() {
      return watcher.get();
    }).then(function(events) {
      // TODO: uncomment when Truffle/testrpc will stop losing events after exception in prev test.
      //assert.equal(events.length, 1);
      //assert.equal(events[0].args.symbol.valueOf(), symbol);
      //assert.equal(events[0].args.value.valueOf(), value);
      //assert.equal(events[0].args.by.valueOf(), accounts[0]);
      return multiAsset.name.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), name);
      return multiAsset.totalSupply.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.description.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), description);
      return multiAsset.baseUnit.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), baseUnit);
      // TODO: check isReissuable;
    }).then(done).catch(done);
  });
  it('should be possible to issue multiple assets', function(done) {
    var multiAsset = MultiAsset.deployed();
    var symbol = bytes32(0);
    var symbol2 = bytes32(1);
    var owner = accounts[0];
    var owner2 = accounts[1];
    var value = 1001;
    var value2 = 3021;
    var name = 'Test Name';
    var name2 = '2Test Name2';
    var description = 'Test Description';
    var description2 = '2Test Description2';
    var baseUnit = 2;
    var baseUnit2 = 4;
    var isReissuable = false;
    var isReissuable2 = true;
    multiAsset.issueAsset(symbol, value, name, description, baseUnit, isReissuable).then(function() {
      return multiAsset.issueAsset(symbol2, value2, name2, description2, baseUnit2, isReissuable2, {from: owner2});
    }).then(function() {
      return multiAsset.name.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), name);
      return multiAsset.name.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), name2);
      return multiAsset.totalSupply.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2);
      return multiAsset.description.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), description);
      return multiAsset.description.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), description2);
      return multiAsset.baseUnit.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), baseUnit);
      return multiAsset.baseUnit.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), baseUnit2);
      return multiAsset.isReissuable.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), isReissuable);
      return multiAsset.isReissuable.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), isReissuable2);
      return multiAsset.owner.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), owner);
      return multiAsset.owner.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), owner2);
    }).then(done).catch(done);
  });
  it('should be possible to get asset name', function(done) {
    var multiAsset = MultiAsset.deployed();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.name.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), NAME);
    }).then(done).catch(done);
  });
  it('should be possible to get asset description', function(done) {
    var multiAsset = MultiAsset.deployed();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.description.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), DESCRIPTION);
    }).then(done).catch(done);
  });
  it('should be possible to get asset base unit', function(done) {
    var multiAsset = MultiAsset.deployed();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.baseUnit.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), BASE_UNIT);
    }).then(done).catch(done);
  });
  it('should be possible to get asset reissuability', function(done) {
    var multiAsset = MultiAsset.deployed();
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.isReissuable.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), isReissuable);
    }).then(done).catch(done);
  });
  it('should be possible to get asset owner', function(done) {
    var multiAsset = MultiAsset.deployed();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), accounts[0]);
    }).then(done).catch(done);
  });
  it('should be possible to get asset total supply with single holder', function(done) {
    var multiAsset = MultiAsset.deployed();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to get asset total supply with multiple holders', function(done) {
    var multiAsset = MultiAsset.deployed();
    var amount = 1001;
    var amount2 = 999;
    var holder2 = accounts[1];
    multiAsset.issueAsset(SYMBOL, amount + amount2, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, amount2, SYMBOL);
    }).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount + amount2);
    }).then(done).catch(done);
  });
  it('should be possible to get asset total supply with multiple holders holding 0 amount', function(done) {
    var multiAsset = MultiAsset.deployed();
    var holder = accounts[0];
    var holder2 = accounts[1];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, VALUE, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder, VALUE, SYMBOL, {from: holder2});
    }).then(function() {
      return multiAsset.revokeAsset(SYMBOL, VALUE);
    }).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to get asset total supply with multiple holders holding (2**256 - 1) amount', function(done) {
    var multiAsset = MultiAsset.deployed();
    var value = UINT_256_MINUS_1;
    var holder = accounts[0];
    var holder2 = accounts[1];
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, 10, SYMBOL);
    }).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to get asset balance for holder', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var symbol2 = bytes32(10);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.issueAsset(symbol2, VALUE-10, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to get asset balance for non owner', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var amount = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(nonOwner, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
    }).then(done).catch(done);
  });
  it('should be possible to get asset balance for missing holder', function(done) {
    var multiAsset = MultiAsset.deployed();
    var nonOwner = accounts[1];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to get missing asset balance for holder', function(done) {
    var multiAsset = MultiAsset.deployed();
    var nonAsset = bytes32(33);
    var owner = accounts[0];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.balanceOf.call(owner, nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to get missing asset balance for missing holder', function(done) {
    var multiAsset = MultiAsset.deployed();
    var nonAsset = bytes32(33);
    var nonOwner = accounts[1];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.balanceOf.call(nonOwner, nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to get name of missing asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.name.call(nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), '');
    }).then(done).catch(done);
  });
  it('should not be possible to get description of missing asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.description.call(nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), '');
    }).then(done).catch(done);
  });
  it('should not be possible to get base unit of missing asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.baseUnit.call(nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to get reissuability of missing asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var nonAsset = bytes32(33);
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.isReissuable.call(nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), false);
    }).then(done).catch(done);
  });
  it('should not be possible to get owner of missing asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.owner.call(nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), '0x0000000000000000000000000000000000000000');
    }).then(done).catch(done);
  });
  it('should not be possible to get total supply of missing asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    multiAsset.totalSupply.call(SYMBOL).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to change ownership by non-owner', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var nonOwner = accounts[1];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.changeOwnership(SYMBOL, nonOwner, {from: nonOwner});
    }).then(function() {
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), owner);
    }).then(done).catch(done);
  });
  it('should not be possible to change ownership to the same owner', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.changeOwnership(SYMBOL, owner);
    }).then(function() {
      // TODO: check that event was not emitted.
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), owner);
    }).then(done).catch(done);
  });
  it('should not be possible to change ownership of missing asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.changeOwnership(nonAsset, nonOwner);
    }).then(function() {
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), owner);
      return multiAsset.owner.call(nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(),'0x0000000000000000000000000000000000000000');
    }).then(done).catch(done);
  });
  it('should be possible to change ownership of asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var newOwner = accounts[1];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.changeOwnership(SYMBOL, newOwner);
    }).then(function() {
      // TODO: check that event was emitted.
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), newOwner);
    }).then(done).catch(done);
  });
  it('should be possible to reissue after ownership change', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var newOwner = accounts[1];
    var isReissuable = true;
    var amount = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.changeOwnership(SYMBOL, newOwner);
    }).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount, {from: newOwner});
    }).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE + amount);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(newOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
    }).then(done).catch(done);
  });
  it('should be possible to revoke after ownership change to missing account', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var newOwner = accounts[1];
    var amount = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.changeOwnership(SYMBOL, newOwner);
    }).then(function() {
      return multiAsset.transfer(newOwner, amount, SYMBOL);
    }).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount, {from: newOwner});
    }).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(newOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to revoke after ownership change to existing account', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var newOwner = accounts[1];
    var amount = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(newOwner, amount, SYMBOL);
    }).then(function() {
      return multiAsset.changeOwnership(SYMBOL, newOwner);
    }).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount, {from: newOwner});
    }).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(newOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should keep ownership change separated between assets', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var newOwner = accounts[1];
    var symbol2 = bytes32(10);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.issueAsset(symbol2, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      return multiAsset.changeOwnership(SYMBOL, newOwner);
    }).then(function() {
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), newOwner);
      return multiAsset.owner.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), owner);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer missing asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var amount = 100;
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(nonOwner, amount, nonAsset);
    }).then(function() {
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(nonOwner, nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(owner, nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer amount 1 with balance 0', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var amount = 1;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(nonOwner, VALUE, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(nonOwner, amount, SYMBOL);
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
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var value = 1;
    var amount = 2;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(nonOwner, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer amount (2**256 - 1) with balance (2**256 - 2)', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var value = UINT_256_MINUS_2;
    var amount = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(nonOwner, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer amount 0', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var amount = 0;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      // TODO: check that Transfer event was not emitted.
      return multiAsset.transfer(nonOwner, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer amount (2**256 - 1) to holder with 1 balance', function(done) {
    // Situation is impossible due to impossibility to issue more than (2**256 - 1) tokens for the asset.
    done();
  });
  it('should not be possible to transfer amount 1 to holder with (2**256 - 1) balance', function(done) {
    // Situation is impossible due to impossibility to issue more than (2**256 - 1) tokens for the asset.
    done();
  });
  it('should not be possible to transfer amount 2**255 to holder with 2**255 balance', function(done) {
    // Situation is impossible due to impossibility to issue more than (2**256 - 1) tokens for the asset.
    done();
  });
  it('should be possible to transfer amount 2**255 to holder with (2**255 - 1) balance', function(done) {
    var multiAsset = MultiAsset.deployed();
    var holder = accounts[0];
    var holder2 = accounts[1];
    var value = UINT_256_MINUS_1;
    var amount = UINT_255;
    var balance2 = UINT_255_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, balance2, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount (2**255 - 1) to holder with 2**255 balance', function(done) {
    var multiAsset = MultiAsset.deployed();
    var holder = accounts[0];
    var holder2 = accounts[1];
    var value = UINT_256_MINUS_1;
    var amount = UINT_255_MINUS_1;
    var balance2 = UINT_255;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, balance2, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount (2**256 - 2) to holder with 1 balance', function(done) {
    var multiAsset = MultiAsset.deployed();
    var holder = accounts[0];
    var holder2 = accounts[1];
    var value = UINT_256_MINUS_1;
    var amount = UINT_256_MINUS_2;
    var balance2 = 1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, balance2, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount 1 to holder with (2**256 - 2) balance', function(done) {
    var multiAsset = MultiAsset.deployed();
    var holder = accounts[0];
    var holder2 = accounts[1];
    var value = UINT_256_MINUS_1;
    var amount = 1;
    var balance2 = UINT_256_MINUS_2;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, balance2, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount 1 to existing holder with 0 balance', function(done) {
    var multiAsset = MultiAsset.deployed();
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, VALUE, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder, amount, SYMBOL, {from: holder2});
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
    var multiAsset = MultiAsset.deployed();
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
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
    var multiAsset = MultiAsset.deployed();
    var holder = accounts[0];
    var holder2 = accounts[1];
    var balance2 = 100;
    var amount = 1;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, balance2, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance2 + amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - balance2 - amount);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount (2**256 - 1) to existing holder with 0 balance', function(done) {
    var multiAsset = MultiAsset.deployed();
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, amount, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder, amount, SYMBOL, {from: holder2});
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount (2**256 - 1) to missing holder', function(done) {
    var multiAsset = MultiAsset.deployed();
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, amount, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should checkSigned on transfer', function(done) {
    var multiAsset = MultiAsset.deployed();
    multiAsset.transfer(accounts[0], 10, SYMBOL).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), 1);
    }).then(done).catch(done);
  });
  it('should keep transfers separated between assets', function(done) {
    var multiAsset = MultiAsset.deployed();
    var symbol = bytes32(0);
    var symbol2 = bytes32(1);
    var value = 500;
    var value2 = 1000;
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 100;
    var amount2 = 33;
    multiAsset.issueAsset(symbol, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.issueAsset(symbol2, value2, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      return multiAsset.transfer(holder2, amount, symbol);
    }).then(function() {
      return multiAsset.transfer(holder2, amount2, symbol2);
    }).then(function() {
      return multiAsset.balanceOf.call(holder, symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value - amount);
      return multiAsset.balanceOf.call(holder2, symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(holder, symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2 - amount2);
      return multiAsset.balanceOf.call(holder2, symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount2);
    }).then(done).catch(done);
  });
  it('should not be possible to reissue asset by non-owner', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, 100, {from: nonOwner});
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to reissue fixed asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var isReissuable = false;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, 100);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to reissue 0 of reissuable asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var isReissuable = true;
    var amount = 0;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      // TODO: check that event was not emitted.
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to reissue missing asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var isReissuable = true;
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(nonAsset, 100);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(owner, nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.totalSupply.call(nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to reissue 1 with total supply (2**256 - 1)', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = UINT_256_MINUS_1;
    var isReissuable = true;
    var amount = 1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      // TODO: check that event was not emitted.
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to reissue (2**256 - 1) with total supply 1', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = 1;
    var isReissuable = true;
    var amount = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      // TODO: check that event was not emitted.
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to reissue 1 with total supply (2**256 - 2)', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = UINT_256_MINUS_2;
    var isReissuable = true;
    var amount = 1;
    var resultValue = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should be possible to reissue 1 with total supply 0', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = 0;
    var isReissuable = true;
    var amount = 1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value + amount);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value + amount);
    }).then(done).catch(done);
  });
  it('should be possible to reissue (2**256 - 1) with total supply 0', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = 0;
    var isReissuable = true;
    var amount = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
    }).then(done).catch(done);
  });
  it('should be possible to reissue (2**256 - 2) with total supply 1', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = 1;
    var isReissuable = true;
    var amount = UINT_256_MINUS_2;
    var resultValue = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should be possible to reissue (2**255 - 1) with total supply 2**255', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = UINT_255;
    var isReissuable = true;
    var amount = UINT_255_MINUS_1;
    var resultValue = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should be possible to reissue 2**255 with total supply (2**255 - 1)', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = UINT_255_MINUS_1;
    var isReissuable = true;
    var amount = UINT_255;
    var resultValue = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should keep reissuance separated between assets', function(done) {
    var multiAsset = MultiAsset.deployed();
    var symbol = bytes32(0);
    var symbol2 = bytes32(1);
    var value = 500;
    var value2 = 1000;
    var holder = accounts[0];
    var amount = 100;
    var amount2 = 33;
    var isReissuable = true;
    multiAsset.issueAsset(symbol, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.issueAsset(symbol2, value2, NAME, DESCRIPTION, BASE_UNIT, isReissuable);
    }).then(function() {
      return multiAsset.reissueAsset(symbol, amount);
    }).then(function() {
      return multiAsset.reissueAsset(symbol2, amount2);
    }).then(function() {
      return multiAsset.balanceOf.call(holder, symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value + amount);
      return multiAsset.totalSupply.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value + amount);
      return multiAsset.balanceOf.call(holder, symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2 + amount2);
      return multiAsset.totalSupply.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2 + amount2);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke 1 from missing asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var amount = 1;
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.revokeAsset(nonAsset, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(owner, nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke 0 from fixed asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var amount = 0;
    var isReissuable = false;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      // TODO: check that event was not emitted.
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke 0 from reissuable asset', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var amount = 0;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      // TODO: check that event was not emitted.
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke 1 with balance 0', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = 0;
    var amount = 1;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      // TODO: check that event was not emitted.
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke 2 with balance 1', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = 1;
    var amount = 2;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      // TODO: check that event was not emitted.
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke (2**256 - 1) with balance (2**256 - 2)', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = UINT_256_MINUS_2;
    var amount = UINT_256_MINUS_1;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      // TODO: check that event was not emitted.
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke 2**255 with balance (2**255 - 1)', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = UINT_255_MINUS_1;
    var amount = UINT_255;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      // TODO: check that event was not emitted.
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke by non-owner', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var balance = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(nonOwner, balance, SYMBOL);
    }).then(function() {
      return multiAsset.revokeAsset(SYMBOL, 10, {from: nonOwner});
    }).then(function() {
      // TODO: check that event was not emitted.
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - balance);
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to revoke 1 from fixed asset with 1 balance', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = 1;
    var amount = 1;
    var isReissuable = false;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      // TODO: check that event was emitted.
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to revoke 1 from reissuable asset with 1 balance', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = 1;
    var amount = 1;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to revoke 2**255 with 2**255 balance', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = UINT_255;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.revokeAsset(SYMBOL, value);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to revoke (2**256 - 1) with (2**256 - 1) balance', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.revokeAsset(SYMBOL, value);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to revoke 1 with 2 balance', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = 2;
    var amount = 1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value - amount);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value - amount);
    }).then(done).catch(done);
  });
  it('should be possible to revoke 2 with (2**256 - 1) balance', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = UINT_256_MINUS_1;
    var amount = 2;
    var resultValue = UINT_256_MINUS_3;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should keep revokes separated between assets', function(done) {
    var multiAsset = MultiAsset.deployed();
    var symbol = bytes32(0);
    var symbol2 = bytes32(1);
    var value = 500;
    var value2 = 1000;
    var holder = accounts[0];
    var amount = 100;
    var amount2 = 33;
    multiAsset.issueAsset(symbol, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.issueAsset(symbol2, value2, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      return multiAsset.revokeAsset(symbol, amount);
    }).then(function() {
      return multiAsset.revokeAsset(symbol2, amount2);
    }).then(function() {
      return multiAsset.balanceOf.call(holder, symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value - amount);
      return multiAsset.totalSupply.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value - amount);
      return multiAsset.balanceOf.call(holder, symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2 - amount2);
      return multiAsset.totalSupply.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2 - amount2);
    }).then(done).catch(done);
  });
  it('should be possible to reissue 1 after revoke 1 with total supply (2**256 - 1)', function(done) {
    var multiAsset = MultiAsset.deployed();
    var owner = accounts[0];
    var value = UINT_256_MINUS_1;
    var amount = 1;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should work with msg.sender or tx.origin?');
});