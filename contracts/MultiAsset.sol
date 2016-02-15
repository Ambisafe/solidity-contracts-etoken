contract MultiAsset {
    
    event Transfer(address indexed from, address indexed to, bytes32 indexed symbol, uint256 value);
    
    struct Asset {
        bytes32 symbol;
        uint8 baseUnit;
        bytes32 name;
        bytes32 description;
        mapping(address => uint) index;
        address[] holders;
        uint[] amounts;
    }
    mapping(bytes32 => uint) public assetIndex;
    Asset[] public assets;

    function MultiAsset() {
        assets.length++;
    }

    function baseUnit(bytes32 _symbol) constant returns(uint8) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset != 0) {
            return assets[posAsset].baseUnit;
        }
    }

    function name(bytes32 _symbol) constant returns(bytes32) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset != 0) {
            return assets[posAsset].name;
        }
    }

    function description(bytes32 _symbol) constant returns(bytes32) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset != 0) {
            return assets[posAsset].description;
        }
    }

    function totalSupply(bytes32 _symbol) constant returns(uint256 supply) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0) {
            return 0;
        }
        uint total = 0;
        for (uint i = 1; i < assets[posAsset].amounts.length; ++i) {
            total += assets[posAsset].amounts[i];
        }
        return total;
    }

    function balanceOf(address _owner, bytes32 _symbol) constant returns(uint256 balance) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0) {
            return 0;
        }
        uint pos = assets[posAsset].index[_owner];
        if (pos == 0) {
            return 0;
        }
        return assets[posAsset].amounts[pos];
    }

    function transfer(address _to, uint256 _value, bytes32 _symbol) returns(bool) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0) {
            return false;
        }
        uint bal = balanceOf(tx.origin, _symbol);
        if (_value <= 1 || bal < _value) {
            return false;
        }
        uint posTo = assets[posAsset].index[_to];
        if (posTo == 0) {
            uint pos = assets[posAsset].amounts.length++;
            assets[posAsset].holders.length++;
            assets[posAsset].amounts[pos] = 0;
            assets[posAsset].holders[pos] = _to;
            assets[posAsset].index[_to] = pos;
            posTo = pos;
        }
        uint posFrom = assets[posAsset].index[tx.origin];
        assets[posAsset].amounts[posFrom] -= _value;
        assets[posAsset].amounts[posTo] += _value;
        Transfer(tx.origin, _to, _symbol, _value);
        return true;
    }

    function issueAsset(bytes32 _symbol, uint _value, bytes32 _name, bytes32 _description, uint8 _baseUnit) returns(bool) {
        if (assetIndex[_symbol] > 0) {
            return false;
        }
        uint pos = assets.length++;

        address[] memory addresses;
        uint[] memory amounts;

        assets[pos] = Asset({
            symbol: _symbol,
            holders: addresses,
            amounts: amounts,
            name: _name,
            description: _description,
            baseUnit: _baseUnit
        });
        assets[pos].amounts[1] = _value;
        assets[pos].holders[1] = tx.origin;
        assets[pos].index[tx.origin] = 1;
        assetIndex[_symbol] = pos;
        Transfer(0x0, tx.origin, _symbol, _value);
        return true;
    }

    function issue(bytes32 _symbol, uint _value) returns (bool) {
        //todo: implement
        //this would require:
        // - add owner to the Asset struct
        // - add isReissuable flag to Asset struct
        // - implements access rights and events
    }
    
    function revoke(bytes32 _symbol, uint _value) returns (bool) {
        //todo: implement
        //this would require:
        // - add owner to the Asset struct
        // - implements access rights and events
    }
    
    function recover(address _from, address _to) returns (bool) {
        //todo: implement
        //this would require:
        // - mark recovered addresse and exclude from txns
        // - migrate ownership if owner recovered
    }
}