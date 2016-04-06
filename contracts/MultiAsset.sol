contract CosignEnabled {

    uint public signChecks;

    modifier checkSigned(bytes32 _opHash) {
        signChecks++;
        _
    }

}

contract MultiAsset is CosignEnabled {

    event Transfer(address indexed from, address indexed to, bytes32 indexed symbol, uint value, string reference);
    event Issue(bytes32 indexed symbol, uint value, address by);
    event Revoke(bytes32 indexed symbol, uint value, address by);
    event OwnershipChange(address indexed from, address indexed to, bytes32 indexed symbol);
    event Approve(address indexed from, address indexed spender, bytes32 indexed symbol, uint value);
    
    struct Asset {
        bytes32 symbol;
        uint8 baseUnit;
        string name;
        string description;
        bool isReissuable;
        uint owner;
        uint totalSupply;
        Wallet[] wallets;
        mapping(uint => uint) index;
    }

    struct Wallet {
        uint balance;
        mapping(uint => uint) allowance;
    }

    struct Holder {
        address addr;
    }

    mapping(address => uint) public holderIndex;
    Holder[] public holders;

    mapping(bytes32 => uint) public assetIndex;
    Asset[] public assets;

    function MultiAsset() {
        assets.length = 1;
        holders.length = 1;
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
            return holders[assets[posAsset].owner].addr;
        }
    }

    function totalSupply(bytes32 _symbol) constant returns(uint) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset != 0) {
            return assets[posAsset].totalSupply;
        }
    }

    function balanceOf(address _owner, bytes32 _symbol) constant returns(uint) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0) {
            return 0;
        }
        uint posWallet = _getPosWallet(posAsset, _owner);
        return assets[posAsset].wallets[posWallet].balance;
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
        uint posFrom = _getPosWallet(posAsset, _from);
        uint posTo = _getPosWallet(posAsset, _to);
        assets[posAsset].wallets[posFrom].balance -= _value;
        assets[posAsset].wallets[posTo].balance += _value;
        Transfer(_from, _to, _symbol, _value, _reference);
        return true;
    }

    function transferWithReference(address _to, uint _value, bytes32 _symbol, string _reference) checkSigned(sha3(msg.data)) returns(bool) {
        return _transfer(msg.sender, _to, _value, _symbol, _reference);
    }

    function transfer(address _to, uint _value, bytes32 _symbol) checkSigned(sha3(msg.data)) returns(bool) {
        return _transfer(msg.sender, _to, _value, _symbol, "");
    }

    function _getPosWallet(uint _posAsset, address _holder) internal returns(uint) {
        uint posHolder = _getPosHolder(_holder);
        uint posWallet = assets[_posAsset].index[posHolder];
        if (posWallet == 0) {
            posWallet = assets[_posAsset].wallets.length++;
            assets[_posAsset].wallets[posWallet].balance = 0;
            assets[_posAsset].index[posHolder] = posWallet;
        }
        return posWallet;
    }

    function _getPosHolder(address _holder) internal returns(uint) {
        uint posHolder = holderIndex[_holder];
        if (posHolder == 0) {
            posHolder = holders.length++;
            holders[posHolder].addr = _holder;
            holderIndex[_holder] = posHolder;
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
        uint posHolder = _getPosHolder(msg.sender);

        assets[pos].symbol = _symbol;
        assets[pos].name = _name;
        assets[pos].isReissuable = _isReissuable;
        assets[pos].owner = posHolder;
        assets[pos].description = _description;
        assets[pos].baseUnit = _baseUnit;
        assets[pos].wallets.length = 2;
        assets[pos].wallets[1].balance = _value;
        assets[pos].index[posHolder] = 1;
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
        if (posAsset == 0 || !assets[posAsset].isReissuable || owner(_symbol) != msg.sender) {
            return false;
        }
        uint _totalSupply = totalSupply(_symbol);
        if (_totalSupply + _value < _totalSupply) {
            return false;
        }
        uint pos = _getPosWallet(posAsset, msg.sender);
        assets[posAsset].wallets[pos].balance += _value;
        assets[posAsset].totalSupply += _value;
        Issue(_symbol, _value, msg.sender);
        return true;
    }
    
    function revokeAsset(bytes32 _symbol, uint _value) returns(bool) {
        if (_value < 1) {
            return false;
        }
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0 || owner(_symbol) != msg.sender) {
            return false;
        }
        uint pos = _getPosWallet(posAsset, msg.sender);
        if (assets[posAsset].wallets[pos].balance < _value) {
            return false;
        }
        assets[posAsset].wallets[pos].balance -= _value;
        assets[posAsset].totalSupply -= _value;
        Revoke(_symbol, _value, msg.sender);
        return true;
    }

    function changeOwnership(bytes32 _symbol, address _newOwner) returns(bool) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0 || owner(_symbol) != msg.sender || owner(_symbol) == _newOwner) {
            return false;
        }
        assets[posAsset].owner = _getPosHolder(_newOwner);
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
        uint posFrom = _getPosWallet(posAsset, msg.sender);
        uint posTo = _getPosHolder(_spender);
        assets[posAsset].wallets[posFrom].allowance[posTo] = _value;
        Approve(msg.sender, _spender, _symbol, _value);
        return true;
    }

    function allowance(address _from, address _spender, bytes32 _symbol) constant returns(uint) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0) {
            return 0;
        }
        uint pos = _getPosWallet(posAsset, _from);
        if (pos == 0) {
            return 0;
        }
        uint posSpender = _getPosHolder(_spender);
        return assets[posAsset].wallets[pos].allowance[posSpender];
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
        uint pos = _getPosWallet(posAsset, _from);
        uint posSpender = _getPosHolder(msg.sender);
        assets[posAsset].wallets[pos].allowance[posSpender] -= _value;
        return true;   
    }
}