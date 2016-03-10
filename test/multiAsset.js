contract('MultiAsset', {reset_state: true}, function(accounts) {
  var bytes32 = function(number) {
    var zeros = '000000000000000000000000000000000000000000000000000000000000000';
    var hexNumber = number.toString(16);
    return '0x' + (zeros + hexNumber).substring(hexNumber.length - 1);
  };

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
      assert.equal(result, name);
      return multiAsset.totalSupply.call(symbol);
    }).then(function(result) {
      assert.equal(result, value);
      return multiAsset.description.call(symbol);
    }).then(function(result) {
      assert.equal(result, description);
      return multiAsset.baseUnit.call(symbol);
    }).then(function(result) {
      assert.equal(result, baseUnit);
      // TODO: check isReissuable;
    }).then(done).catch(done);
  });
  it('should be possible to issue asset with 1 bit 0 symbol');
  it('should be possible to issue asset with 1 bit 1 symbol');
  it('should be possible to issue asset with 32 bytes symbol');
  it('should not be possible to issue asset with 257 bits symbol');
  it('should not be possible to issue fixed asset with 0 value');
  it('should be possible to issue fixed asset with 1 value');
  it('should be possible to issue fixed asset with 2**255 value');
  it('should not be possible to issue fixed asset with (2**255 + 1) value');
  it('should be possible to issue reissuable asset with 0 value');
  it('should be possible to issue reissuable asset with 1 value');
  it('should be possible to issue reissuable asset with 2**255 value');
  it('should not be possible to issue reissuable asset with (2**255 + 1) value');
  it('should not be possible to issue asset with base unit 0');
  it('should be possible to issue asset with base unit 1');
  it('should be possible to issue asset with base unit 128');
  it('should not be possible to issue asset with base unit 129');
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
      assert.equal(events.length, 1);
      assert.equal(events[0].args.symbol.valueOf(), symbol);
      assert.equal(events[0].args.value.valueOf(), value);
      assert.equal(events[0].args.by.valueOf(), accounts[0]);
      return multiAsset.name.call(symbol);
    }).then(function(result) {
      assert.equal(result, name);
      return multiAsset.totalSupply.call(symbol);
    }).then(function(result) {
      assert.equal(result, value);
      return multiAsset.description.call(symbol);
    }).then(function(result) {
      assert.equal(result, description);
      return multiAsset.baseUnit.call(symbol);
    }).then(function(result) {
      assert.equal(result, baseUnit);
      // TODO: check isReissuable;
    }).then(done).catch(done);
  });
  it('should be possible to issue multiple assets', function(done) {
    var multiAsset = MultiAsset.deployed();
    var symbol = bytes32(0);
    var symbol2 = bytes32(1);
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
      return multiAsset.issueAsset(symbol2, value2, name2, description2, baseUnit2, isReissuable2);
    }).then(function() {
      return multiAsset.name.call(symbol);
    }).then(function(result) {
      assert.equal(result, name);
      return multiAsset.name.call(symbol2);
    }).then(function(result) {
      assert.equal(result, name2);
      return multiAsset.totalSupply.call(symbol);
    }).then(function(result) {
      assert.equal(result, value);
      return multiAsset.totalSupply.call(symbol2);
    }).then(function(result) {
      assert.equal(result, value2);
      return multiAsset.description.call(symbol);
    }).then(function(result) {
      assert.equal(result, description);
      return multiAsset.description.call(symbol2);
    }).then(function(result) {
      assert.equal(result, description2);
      return multiAsset.baseUnit.call(symbol);
    }).then(function(result) {
      assert.equal(result, baseUnit);
      return multiAsset.baseUnit.call(symbol2);
    }).then(function(result) {
      assert.equal(result, baseUnit2);
      // TODO: check isReissuable;
    }).then(done).catch(done);
  });
  it('should be possible to get asset name');
  it('should be possible to get asset description');
  it('should be possible to get asset base unit');
  it('should be possible to get asset reissuability');
  it('should be possible to get asset total supply with single holder');
  it('should be possible to get asset total supply with multiple holders');
  it('should be possible to get asset total supply with multiple holders holding 0 amount');
  it('should be possible to get asset balance for holder');
  it('should be possible to get asset balance for missing holder');
  it('should be possible to get missing asset balance for holder');
  it('should be possible to get missing asset balance for missing holder');
  it('should not be possible to get name of missing asset');
  it('should not be possible to get description of missing asset');
  it('should not be possible to get base unit of missing asset');
  it('should not be possible to get reissuability of missing asset');
  it('should not be possible to get total supply of missing asset');
  it('should not be possible to transfer missing asset');
  it('should not be possible to transfer amount 1 with balance 0');
  it('should not be possible to transfer amount 2 with balance 1');
  it('should not be possible to transfer amount 2**255 with balance (2**255 - 1)');
  it('should not be possible to transfer amount 0');
  it('should not be possible to transfer amount 2**255 to holder with 1 balance');
  it('should not be possible to transfer amount 1 to holder with 2**255 balance');
  it('should not be possible to transfer amount 2**254 to holder with (2**254 + 1) balance');
  it('should not be possible to transfer amount (2**254 + 1) to holder with 2**254 balance');
  it('should be possible to transfer amount 2**254 to holder with 2**254 balance');
  it('should be possible to transfer amount (2**255 - 1) to holder with 1 balance');
  it('should be possible to transfer amount 1 to holder with (2**255 - 1) balance');
  it('should be possible to transfer amount 1 to existing holder with 0 balance');
  it('should be possible to transfer amount 1 to existing holder with non-zero balance');
  it('should be possible to transfer amount 2**255 to holder with 0 balance');
  it('should be possible to transfer amount 1 to existing holder with non-zero balance');
  it('should be possible to transfer amount 1 to missing holder');
  it('should be possible to transfer amount 2**255 to missing holder');
  it('should not be possible to reissue fixed asset');
  it('should not be possible to reissue 0 of reissuable asset');
  it('should not be possible to reissue missing asset');
  it('should not be possible to reissue 1 with total supply 2**255');
  it('should not be possible to reissue 2**255 with total supply 1');
  it('should be possible to reissue 1 with total supply (2**255 - 1)');
  it('should be possible to reissue 1 with total supply 0');
  it('should be possible to reissue 2**255 with total supply 0');
  it('should be possible to reissue (2**255 - 1) with total supply 1');
  it('should be possible to reissue 2**254 with total supply 2**254');
  it('should not be possible to revoke 1 from missing asset');
  it('should not be possible to revoke 0 from fixed asset');
  it('should not be possible to revoke 0 from reissuable asset');
  it('should not be possible to revoke 1 with balance 0');
  it('should not be possible to revoke 2 with balance 1');
  it('should not be possible to revoke 2**255 with balance (2**255 - 1)');
  it('should not be possible to revoke 2**254 with balance (2**254 - 1)');
  it('should be possible to revoke 1 from fixed asset with 1 balance');
  it('should be possible to revoke 1 from reissuable asset with 1 balance');
  it('should be possible to revoke 2**254 with 2**254 balance');
  it('should be possible to revoke 2**255 with 2**255 balance');
  it('should be possible to revoke 1 with 2 balance');
  it('should be possible to revoke 2 with 2**255 balance');
  it('should be possible to reissue 1 after revoke 1 with total supply 2**255');
  it('should not mess with other assets/holders');
});