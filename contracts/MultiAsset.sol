import "Asset.sol";

contract MultiAsset {
    
    struct Entry {
        bytes32 symbol;
        string name;
        string description;
        address addr;
    }
    
    mapping(bytes32 => uint) public entryIndex;
    Entry[] public entries;

    function MultiAsset() {
        entries.length++;
    }

    function name(bytes32 _symbol) constant returns(string) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            return entries[posEntry].name;
        }
    }

    function description(bytes32 _symbol) constant returns(string) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            return entries[posEntry].description;
        }
    }

    function baseUnit(bytes32 _symbol) constant returns(uint8) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            Asset asset = Asset(entries[posEntry].addr);
            return asset.baseUnit();
        }
    }

    function isReissuable(bytes32 _symbol) constant returns(bool) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            Asset asset = Asset(entries[posEntry].addr);
            return asset.isReissuable();
        }
    }

    function owner(bytes32 _symbol) constant returns(address) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            Asset asset = Asset(entries[posEntry].addr);
            return asset.getOwner();
        }
    }

    function totalSupply(bytes32 _symbol) constant returns(uint) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            Asset asset = Asset(entries[posEntry].addr);
            return asset.totalSupply();
        }
    }

    function balanceOf(address _owner, bytes32 _symbol) constant returns(uint) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry == 0) {
            return 0;
        }
        Asset asset = Asset(entries[posEntry].addr);
        return asset.balanceOf(_owner);
    }

    function issueAsset(bytes32 _symbol, uint _value, string _name, string _description, uint8 _baseUnit, bool _isReissuable, address _addr) returns(bool) {
        if (_value < 1 && !_isReissuable) {
            return false;
        }
        uint pos = entryIndex[_symbol];
        if (pos > 0) {
            return false;
        }
        pos = entries.length++;

        entries[pos].symbol = _symbol;
        entries[pos].name = _name;
        entries[pos].description = _description;
        entries[pos].addr = _addr;
        entryIndex[_symbol] = pos;
        Asset asset = Asset(_addr);
        asset.issueAsset(_symbol, _value, _baseUnit, _isReissuable);
        return true;
    }
    
    function reissueAsset(bytes32 _symbol, uint _value) returns(bool) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            Asset asset = Asset(entries[posEntry].addr);
            return asset.reissueAsset(_value);
        }
    }
    
    function revokeAsset(bytes32 _symbol, uint _value) returns(bool) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            Asset asset = Asset(entries[posEntry].addr);
            return asset.revokeAsset(_value);
        }
    }

    function changeOwnership(bytes32 _symbol, address _newOwner) returns(bool) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            Asset asset = Asset(entries[posEntry].addr);
            return asset.changeOwnership(_newOwner);
        }
    }

    function approve(address _spender, uint _value, bytes32 _symbol) returns(bool) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            Asset asset = Asset(entries[posEntry].addr);
            return asset.approve(_spender, _value);
        }
    }

    function allowance(address _from, address _spender, bytes32 _symbol) constant returns(uint) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            Asset asset = Asset(entries[posEntry].addr);
            return asset.allowance(_from, _spender);
        }
    }

    function transfer(address _to, uint _value, bytes32 _symbol) returns(bool) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            Asset asset = Asset(entries[posEntry].addr);
            return asset.transfer(_to, _value);
        }
    }

    function transferWithReference(address _to, uint _value, bytes32 _symbol, string _reference) returns(bool) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            Asset asset = Asset(entries[posEntry].addr);
            return asset.transferWithReference(_to, _value, _reference);
        }
    }

    function transferFrom(address _from, address _to, uint _value, bytes32 _symbol) returns(bool) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            Asset asset = Asset(entries[posEntry].addr);
            return asset.transferFrom(_from, _to, _value);
        }
    }

    function transferFromWithReference(address _from, address _to, uint _value, bytes32 _symbol, string _reference)  returns(bool) {
        uint posEntry = entryIndex[_symbol];
        if (posEntry != 0) {
            Asset asset = Asset(entries[posEntry].addr);
            return asset.transferFromWithReference(_from, _to, _value, _reference);
        }
    }
    
}