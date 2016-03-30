import "CosignEnabled.sol";

contract MultiAsset is CosignEnabled {
    
    event Transfer(address indexed from, address indexed to, bytes32 indexed symbol, uint256 value);
    event Issue(bytes32 indexed symbol, uint256 value, address by);
    event Revoke(bytes32 indexed symbol, uint256 value, address by);
    event OwnershipChange(address indexed from, address indexed to, bytes32 indexed symbol);
    event Approve(address indexed from, address indexed spender, bytes32 indexed symbol, uint256 value);
    
    struct Asset {
        bytes32 symbol;
        uint8 baseUnit;
        string name;
        string description;
        bool isReissuable;
        address owner;
        mapping(address => uint) index;
        Holder[] holders;
        uint[] amounts;
    }

    struct Holder {
        address addr;
        mapping(address => uint) allowance;
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

    function name(bytes32 _symbol) constant returns(string) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset != 0) {
            return assets[posAsset].name;
        }
    }

    function description(bytes32 _symbol) constant returns(string) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset != 0) {
            return assets[posAsset].description;
        }
    }

    function isReissuable(bytes32 _symbol) constant returns(bool) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset != 0) {
            return assets[posAsset].isReissuable;
        }
    }

    function owner(bytes32 _symbol) constant returns(address) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset != 0) {
            return assets[posAsset].owner;
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

    function transfer(address _to, uint256 _value, bytes32 _symbol) checkSigned(sha3(msg.data)) returns(bool) {
        if (msg.sender == _to) {
            return false;
        }
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0) {
            return false;
        }
        uint bal = balanceOf(msg.sender, _symbol);
        if (_value < 1 || bal < _value) {
            return false;
        }
        uint posTo = _getPosHolder(posAsset, _to);
        uint posFrom = assets[posAsset].index[msg.sender];
        assets[posAsset].amounts[posFrom] -= _value;
        assets[posAsset].amounts[posTo] += _value;
        Transfer(msg.sender, _to, _symbol, _value);
        return true;
    }

    function _getPosHolder(uint _posAsset, address _holder) internal returns(uint) {
        uint posHolder = assets[_posAsset].index[_holder];
        if (posHolder == 0) {
            uint pos = assets[_posAsset].amounts.length++;
            assets[_posAsset].holders.length++;
            assets[_posAsset].amounts[pos] = 0;
            assets[_posAsset].holders[pos].addr = _holder;
            assets[_posAsset].index[_holder] = pos;
            posHolder = pos;
        }
        return posHolder;
    }

    function issueAsset(bytes32 _symbol, uint _value, string _name, string _description, uint8 _baseUnit, bool _isReissuable) returns(bool) {
        if (_value < 1 && !_isReissuable) {
            return false;
        }
        uint pos = assetIndex[_symbol];
        if (pos > 0) {
            return false;
        }
        pos = assets.length++;

        assets[pos].symbol = _symbol;
        assets[pos].name = _name;
        assets[pos].isReissuable = _isReissuable;
        assets[pos].owner = msg.sender;
        assets[pos].description = _description;
        assets[pos].baseUnit = _baseUnit;
        assets[pos].amounts.length = 2;
        assets[pos].holders.length = 2;
        assets[pos].amounts[1] = _value;
        assets[pos].holders[1].addr = msg.sender;
        assets[pos].index[msg.sender] = 1;
        assetIndex[_symbol] = pos;
        Issue(_symbol, _value, msg.sender);
        return true;
    }
    
    function reissueAsset(bytes32 _symbol, uint _value) returns(bool) {
        if (_value < 1) {
            return false;
        }
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0 || !assets[posAsset].isReissuable || assets[posAsset].owner != msg.sender) {
            return false;
        }
        uint _totalSupply = totalSupply(_symbol);
        if (_totalSupply + _value < _totalSupply) {
            return false;
        }
        uint pos = _getPosHolder(posAsset, msg.sender);
        assets[posAsset].amounts[pos] += _value;
        Issue(_symbol, _value, msg.sender);
        return true;
    }
    
    function revokeAsset(bytes32 _symbol, uint _value) returns(bool) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0 || assets[posAsset].owner != msg.sender) {
            return false;
        }
        uint pos = _getPosHolder(posAsset, msg.sender);
        if (assets[posAsset].amounts[pos] < _value) {
            return false;
        }
        assets[posAsset].amounts[pos] -= _value;
        Revoke(_symbol, _value, msg.sender);
        return true;
    }

    function changeOwnership(bytes32 _symbol, address _newOwner) returns(bool) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0 || assets[posAsset].owner != msg.sender) {
            return false;
        }
        assets[posAsset].owner = _newOwner;
        OwnershipChange(msg.sender, _newOwner, _symbol);
        return true;
    }
    
    function recoverAccount(address _from, address _to) returns(bool) {
        //todo: implement
        //this would require:
        // - mark recovered addresse and exclude from txns
        // - migrate ownership if owner recovered
    }

    function approve(address _spender, uint _value, bytes32 _symbol) returns(bool) {
        if (msg.sender == _spender) {
            return false;
        }
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0) {
            return false;
        }
        uint posFrom = _getPosHolder(posAsset, msg.sender);
        assets[posAsset].holders[posFrom].allowance[_spender] = _value;
        Approve(msg.sender, _spender, _symbol, _value);
        return true;
    }

    function allowance(address _from, address _spender, bytes32 _symbol) constant returns(uint) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0) {
            return 0;
        }
        uint pos = assets[posAsset].index[_from];
        if (pos == 0) {
            return 0;
        }
        return assets[posAsset].holders[pos].allowance[_spender];
    }
}