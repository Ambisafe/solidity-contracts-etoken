contract CosignEnabled {

    uint public signChecks;

    modifier checkSigned(bytes32 _opHash) {
        signChecks++;
        _
    }

}

contract MultiAsset is CosignEnabled {

    event Transfer(address indexed from, address indexed to, bytes32 indexed symbol, uint256 value, string reference);
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
        Holder[] holders;
        uint totalSupply;
        mapping(address => uint) index;
    }

    struct Holder {
        address addr;
        mapping(address => uint) allowance;
        uint balance;
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
        return assets[posAsset].totalSupply;
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
        return assets[posAsset].holders[pos].balance;
    }

    function _transfer(address _from, address _to, uint _value, bytes32 _symbol, string _reference) internal returns(bool) {
        if (_from == _to) {
            return false;
        }
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0) {
            return false;
        }
        uint bal = balanceOf(_from, _symbol);
        if (_value < 1 || bal < _value) {
            return false;
        }
        uint posTo = _getPosHolder(posAsset, _to);
        uint posFrom = assets[posAsset].index[_from];
        assets[posAsset].holders[posFrom].balance -= _value;
        assets[posAsset].holders[posTo].balance += _value;
        Transfer(_from, _to, _symbol, _value, _reference);
        return true;
    }

    function transferWithReference(address _to, uint256 _value, bytes32 _symbol, string _reference) checkSigned(sha3(msg.data)) returns(bool) {
        return _transfer(msg.sender, _to, _value, _symbol, _reference);
    }

    function transfer(address _to, uint256 _value, bytes32 _symbol) checkSigned(sha3(msg.data)) returns(bool) {
        return _transfer(msg.sender, _to, _value, _symbol, "");
    }

    function _getPosHolder(uint _posAsset, address _holder) internal returns(uint) {
        uint posHolder = assets[_posAsset].index[_holder];
        if (posHolder == 0) {
            uint pos = assets[_posAsset].holders.length++;
            assets[_posAsset].holders[pos].balance = 0;
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
        assets[pos].holders.length = 2;
        assets[pos].holders[1].balance = _value;
        assets[pos].holders[1].addr = msg.sender;
        assets[pos].index[msg.sender] = 1;
        assets[pos].totalSupply = _value;
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
        assets[posAsset].holders[pos].balance += _value;
        assets[posAsset].totalSupply += _value;
        Issue(_symbol, _value, msg.sender);
        return true;
    }
    
    function revokeAsset(bytes32 _symbol, uint _value) returns(bool) {
        if (_value < 1) {
            return false;
        }
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0 || assets[posAsset].owner != msg.sender) {
            return false;
        }
        uint pos = _getPosHolder(posAsset, msg.sender);
        if (assets[posAsset].holders[pos].balance < _value) {
            return false;
        }
        assets[posAsset].holders[pos].balance -= _value;
        assets[posAsset].totalSupply -= _value;
        Revoke(_symbol, _value, msg.sender);
        return true;
    }

    function changeOwnership(bytes32 _symbol, address _newOwner) returns(bool) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0 || assets[posAsset].owner != msg.sender || assets[posAsset].owner == _newOwner) {
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

    function transferFrom(address _from, address _to, uint _value, bytes32 _symbol) returns(bool) {
        return transferFromWithReference(_from, _to, _value, _symbol, "");
    }

    function transferFromWithReference(address _from, address _to, uint _value, bytes32 _symbol, string _reference) returns(bool) {
        if (msg.sender == _from) {
            return false;
        }
        if (allowance(_from, msg.sender, _symbol) < _value) {
            return false;
        }
        if (!_transfer(_from, _to, _value, _symbol, _reference)) {
            return false;
        }
        uint posAsset = assetIndex[_symbol];
        uint pos = assets[posAsset].index[_from];
        assets[posAsset].holders[pos].allowance[msg.sender] -= _value;
        return true;   
    }
}