contract Cosigner {
    function isSigned(bytes32) returns(bool);
}

contract CosignEnabled {
    address public contractOwner;
    mapping(bytes32 => address) public cosignerAddresses;
    mapping(bytes32 => Cosigner) cosigners;
    uint public signChecks; // DEPLOY REMOVE

    function CosignEnabled() {
        contractOwner = msg.sender;
    }

    modifier onlyContractOwner() {
        if (contractOwner == msg.sender) {
            _
        }
    }

    function changeContractOwnership(address _to) onlyContractOwner() returns(bool) {
        contractOwner = _to;
        return true;
    }

    modifier checkSigned(bytes32 _opHash, bytes32 _symbol) {
        signChecks++; // DEPLOY REMOVE
        if (cosignerAddresses[_symbol] == 0x0 || cosigners[_symbol].isSigned(_opHash)) {
            _
        }
    }

    function setCosignAddress(address _address, bytes32 _symbol) onlyContractOwner() returns(bool) {
        if(cosignerAddresses[_symbol] == _address) {
            return false;
        }
        cosignerAddresses[_symbol] = _address;
        cosigners[_symbol] = Cosigner(cosignerAddresses[_symbol]);
        return true;
    }
}

contract MultiAsset is CosignEnabled {

    event Transfer(address indexed from, address indexed to, bytes32 indexed symbol, uint value, string reference);
    event Issue(bytes32 indexed symbol, uint value, address by);
    event Revoke(bytes32 indexed symbol, uint value, address by);
    event OwnershipChange(address indexed from, address indexed to, bytes32 indexed symbol);
    event Approve(address indexed from, address indexed spender, bytes32 indexed symbol, uint value);
    event Recovery(address indexed from, address indexed to, address by);
    
    struct Asset {
        bytes32 symbol;
        uint8 baseUnit;
        string name;
        string description;
        bool isReissuable;
        uint owner;
        uint totalSupply;
        mapping(uint => Wallet) wallets;
    }

    struct Wallet {
        uint balance;
        mapping(uint => uint) allowance;
    }

    struct Holder {
        address[] trusts;
        address addr;
        mapping(address => uint) trustIndex;
    }

    mapping(address => uint) public holderIndex;
    Holder[] public holders;

    mapping(bytes32 => uint) public assetIndex;
    Asset[] public assets;

    modifier onlyOwner(bytes32 _symbol) {
        if (isOwner(msg.sender, _symbol)) {
            _
        }
    }

    modifier checkTrust(address _from, address _to) {
        if (isTrusted(_from, _to)) {
            _
        }
    }

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

    function isOwner(address _owner, bytes32 _symbol) constant returns(bool) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset != 0) {
            return assets[posAsset].owner == _getPosHolder(_owner);
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
        uint posHolder = _getPosHolder(_owner);
        return assets[posAsset].wallets[posHolder].balance;
    }

    function _address(uint pos) constant internal returns(address) {
        return holders[pos].addr;
    }

    function _transfer(address _from, address _to, uint _value, bytes32 _symbol, string _reference) internal returns(bool) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0) {
            return false;
        }
        uint bal = balanceOf(_from, _symbol);
        if (_value < 1 || bal < _value) {
            return false;
        }
        uint posFrom = _getPosHolder(_from);
        uint posTo = _createPosHolder(_to);
        if (posFrom == posTo) {
            return false;
        }
        assets[posAsset].wallets[posFrom].balance -= _value;
        assets[posAsset].wallets[posTo].balance += _value;
        Transfer(_address(posFrom), _address(posTo), _symbol, _value, _reference);
        return true;
    }

    function transferWithReference(address _to, uint _value, bytes32 _symbol, string _reference) checkSigned(sha3(msg.data), _symbol) returns(bool) {
        return _transfer(msg.sender, _to, _value, _symbol, _reference);
    }

    function transfer(address _to, uint _value, bytes32 _symbol) checkSigned(sha3(msg.data), _symbol) returns(bool) {
        return _transfer(msg.sender, _to, _value, _symbol, "");
    }

    function _getPosHolder(address _holder) constant internal returns(uint) {
        return holderIndex[_holder];
    }

    function _createPosHolder(address _holder) internal returns(uint) {
        uint posHolder = holderIndex[_holder];
        if (posHolder == 0) {
            posHolder = holders.length++;
            holders[posHolder].addr = _holder;
            holders[posHolder].trusts.length = 1;
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
        uint posHolder = _createPosHolder(msg.sender);

        assets[pos].symbol = _symbol;
        assets[pos].name = _name;
        assets[pos].isReissuable = _isReissuable;
        assets[pos].owner = posHolder;
        assets[pos].description = _description;
        assets[pos].baseUnit = _baseUnit;
        assets[pos].wallets[posHolder].balance = _value;
        assets[pos].totalSupply = _value;
        assetIndex[_symbol] = pos;
        Issue(_symbol, _value, _address(posHolder));
        return true;
    }
    
    function reissueAsset(bytes32 _symbol, uint _value) onlyOwner(_symbol) returns(bool) {
        if (_value < 1) {
            return false;
        }
        uint posAsset = assetIndex[_symbol];
        if (!assets[posAsset].isReissuable) {
            return false;
        }
        uint _totalSupply = totalSupply(_symbol);
        if (_totalSupply + _value < _totalSupply) {
            return false;
        }
        uint pos = _getPosHolder(msg.sender);
        assets[posAsset].wallets[pos].balance += _value;
        assets[posAsset].totalSupply += _value;
        Issue(_symbol, _value, _address(pos));
        return true;
    }
    
    function revokeAsset(bytes32 _symbol, uint _value) onlyOwner(_symbol) returns(bool) {
        if (_value < 1) {
            return false;
        }
        uint posAsset = assetIndex[_symbol];
        uint pos = _getPosHolder(msg.sender);
        if (assets[posAsset].wallets[pos].balance < _value) {
            return false;
        }
        assets[posAsset].wallets[pos].balance -= _value;
        assets[posAsset].totalSupply -= _value;
        Revoke(_symbol, _value, _address(pos));
        return true;
    }

    function changeOwnership(bytes32 _symbol, address _newOwner) onlyOwner(_symbol) returns(bool) {
        uint posAsset = assetIndex[_symbol];
        uint posNewOwner = _createPosHolder(_newOwner);
        if (assets[posAsset].owner == posNewOwner) {
            return false;
        }
        address oldOwner = _address(assets[posAsset].owner);
        assets[posAsset].owner = posNewOwner;
        OwnershipChange(oldOwner, _address(posNewOwner), _symbol);
        return true;
    }

    function isTrusted(address _from, address _to) constant returns(bool) {
        uint posFrom = _getPosHolder(_from);
        if (posFrom == 0) {
            return false;
        }
        return holders[posFrom].trustIndex[_to] != 0;
    }

    function trust(address _to) returns(bool) {
        uint posFrom = _createPosHolder(msg.sender);
        if (posFrom == _getPosHolder(_to)) {
            return false;
        }
        if (isTrusted(msg.sender, _to)) {
            return false;
        }
        uint trustPos = holders[posFrom].trusts.length++;
        holders[posFrom].trusts[trustPos] = _to;
        holders[posFrom].trustIndex[_to] = trustPos;
        return true;
    }

    function distrust(address _to) checkTrust(msg.sender, _to) returns(bool) {
        uint posFrom = _getPosHolder(msg.sender);
        uint trustPos = holders[posFrom].trustIndex[_to];
        address[] trusts = holders[posFrom].trusts;
        if (trustPos < trusts.length-1) {
            address last = trusts[trusts.length-1];
            trusts[trustPos] = last;
            holders[posFrom].trustIndex[last] = trustPos; 
        }
        trusts.length--;
        delete holders[posFrom].trustIndex[_to];
        return true;
    }

    function distrustAll() returns(bool) {
        uint posFrom = _getPosHolder(msg.sender);
        if (posFrom == 0) {
            return false;
        }
        address[] trusts = holders[posFrom].trusts;
        if (trusts.length == 1) {
            return false;
        }
        for (uint i = 1; i < trusts.length; i++) {
            delete holders[posFrom].trustIndex[trusts[i]];
        }
        trusts.length = 1;
        return true;
    }
    
    function recover(address _from, address _to) checkTrust(_from, msg.sender) returns(bool) {
        uint posFrom = _getPosHolder(_from);
        if (_getPosHolder(_to) != 0) {
            return false;
        }
        address from = holders[posFrom].addr;
        holders[posFrom].addr = _to;
        holderIndex[_to] = posFrom;
        Recovery(from, _to, msg.sender);
        return true;
    }

    function approve(address _spender, uint _value, bytes32 _symbol) returns(bool) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0) {
            return false;
        }
        uint posFrom = _createPosHolder(msg.sender);
        uint posTo = _createPosHolder(_spender);
        if (posFrom == posTo) {
            return false;
        }
        assets[posAsset].wallets[posFrom].allowance[posTo] = _value;
        Approve(_address(posFrom), _address(posTo), _symbol, _value);
        return true;
    }

    function allowance(address _from, address _spender, bytes32 _symbol) constant returns(uint) {
        uint posAsset = assetIndex[_symbol];
        if (posAsset == 0) {
            return 0;
        }
        uint pos = _getPosHolder(_from);
        uint posSpender = _getPosHolder(_spender);
        return assets[posAsset].wallets[pos].allowance[posSpender];
    }

    function transferFrom(address _from, address _to, uint _value, bytes32 _symbol) returns(bool) {
        return transferFromWithReference(_from, _to, _value, _symbol, "");
    }

    function transferFromWithReference(address _from, address _to, uint _value, bytes32 _symbol, string _reference) checkSigned(sha3(msg.data), _symbol)  returns(bool) {
        if (allowance(_from, msg.sender, _symbol) < _value) {
            return false;
        }
        if (!_transfer(_from, _to, _value, _symbol, _reference)) {
            return false;
        }
        uint posAsset = assetIndex[_symbol];
        uint pos = _getPosHolder(_from);
        uint posSpender = _getPosHolder(msg.sender);
        assets[posAsset].wallets[pos].allowance[posSpender] -= _value;
        return true;   
    }
}