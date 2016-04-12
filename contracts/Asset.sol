contract Cosigner {
    function isSigned(bytes32) returns(bool);
}

contract CosignEnabled {

    uint public signChecks;

    modifier checkSigned(bytes32 _opHash) {
        signChecks++;
        _
    }

}

contract Asset is CosignEnabled {

    event Transfer(address indexed from, address indexed to, uint value, string reference);
    event Issue(uint value, address by);
    event Revoke(uint value, address by);
    event OwnershipChange(address indexed from, address indexed to);
    event Approve(address indexed from, address indexed spender, uint value);
    event Recovery(address indexed from, address indexed to, address by);
    
    bytes32 public symbol;
    uint8 public baseUnit;
    bool public isReissuable;
    uint public owner;
    uint public totalSupply;
    mapping(uint => Wallet) wallets;

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


    modifier onlyOwner() {
        if (isOwner(tx.origin)) {
            _
        }
    }

    modifier checkTrust(address _from, address _to) {
        if (isTrusted(_from, _to)) {
            _
        }
    }

    function Asset() {
        holders.length = 1;
    }
    
    function issueAsset(bytes32 _symbol, uint _value, uint8 _baseUnit, bool _isReissuable) returns(bool) {
        if (_value < 1 && !_isReissuable) {
            return false;
        }
        if (symbol != 0x0) {
            return false;
        }
        uint posHolder = _createPosHolder(tx.origin);

        symbol = _symbol;
        isReissuable = _isReissuable;
        owner = posHolder;
        baseUnit = _baseUnit;
        wallets[posHolder].balance = _value;
        totalSupply = _value;
        Issue(_value, _address(posHolder));
        return true;
    }

    function isOwner(address _owner) constant returns(bool) {
        return owner == _getPosHolder(_owner);
    }

    function getOwner() constant returns(address) {
        return holders[owner].addr;
    }

    function balanceOf(address _owner) constant returns(uint) {
        uint posHolder = _getPosHolder(_owner);
        return wallets[posHolder].balance;
    }

    function _address(uint pos) constant internal returns(address) {
        return holders[pos].addr;
    }

    function _transfer(address _from, address _to, uint _value, string _reference) internal returns(bool) {
        uint bal = balanceOf(_from);
        if (_value < 1 || bal < _value) {
            return false;
        }
        uint posFrom = _getPosHolder(_from);
        uint posTo = _createPosHolder(_to);
        if (posFrom == posTo) {
            return false;
        }
        wallets[posFrom].balance -= _value;
        wallets[posTo].balance += _value;
        Transfer(_address(posFrom), _address(posTo), _value, _reference);
        return true;
    }

    function transferWithReference(address _to, uint _value, string _reference) checkSigned(sha3(msg.data)) returns(bool) {
        return _transfer(tx.origin, _to, _value, _reference);
    }

    function transfer(address _to, uint _value) checkSigned(sha3(msg.data)) returns(bool) {
        return _transfer(tx.origin, _to, _value, "");
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
    
    function reissueAsset(uint _value) onlyOwner() returns(bool) {
        if (_value < 1) {
            return false;
        }
        if (!isReissuable) {
            return false;
        }
        if (totalSupply + _value < totalSupply) {
            return false;
        }
        uint pos = _getPosHolder(tx.origin);
        wallets[pos].balance += _value;
        totalSupply += _value;
        Issue(_value, _address(pos));
        return true;
    }
    
    function revokeAsset(uint _value) onlyOwner() returns(bool) {
        if (_value < 1) {
            return false;
        }
        uint pos = _getPosHolder(tx.origin);
        if (wallets[pos].balance < _value) {
            return false;
        }
        wallets[pos].balance -= _value;
        totalSupply -= _value;
        Revoke(_value, _address(pos));
        return true;
    }

    function changeOwnership(address _newOwner) onlyOwner() returns(bool) {
        uint posNewOwner = _createPosHolder(_newOwner);
        if (owner == posNewOwner) {
            return false;
        }
        address oldOwner = _address(owner);
        owner = posNewOwner;
        OwnershipChange(oldOwner, _address(posNewOwner));
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
        uint posFrom = _createPosHolder(tx.origin);
        if (posFrom == _getPosHolder(_to)) {
            return false;
        }
        if (isTrusted(tx.origin, _to)) {
            return false;
        }
        uint trustPos = holders[posFrom].trusts.length++;
        holders[posFrom].trusts[trustPos] = _to;
        holders[posFrom].trustIndex[_to] = trustPos;
        return true;
    }

    function distrust(address _to) checkTrust(tx.origin, _to) returns(bool) {
        uint posFrom = _getPosHolder(tx.origin);
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
        uint posFrom = _getPosHolder(tx.origin);
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
    
    function recover(address _from, address _to) checkTrust(_from, tx.origin) returns(bool) {
        uint posFrom = _getPosHolder(_from);
        if (_getPosHolder(_to) != 0) {
            return false;
        }
        address from = holders[posFrom].addr;
        holders[posFrom].addr = _to;
        holderIndex[_to] = posFrom;
        Recovery(from, _to, tx.origin);
        return true;
    }

    function approve(address _spender, uint _value) returns(bool) {
        uint posFrom = _createPosHolder(tx.origin);
        uint posTo = _createPosHolder(_spender);
        if (posFrom == posTo) {
            return false;
        }
        wallets[posFrom].allowance[posTo] = _value;
        Approve(_address(posFrom), _address(posTo), _value);
        return true;
    }

    function allowance(address _from, address _spender) constant returns(uint) {
        uint pos = _getPosHolder(_from);
        uint posSpender = _getPosHolder(_spender);
        return wallets[pos].allowance[posSpender];
    }

    function transferFrom(address _from, address _to, uint _value) returns(bool) {
        return transferFromWithReference(_from, _to, _value, "");
    }

    function transferFromWithReference(address _from, address _to, uint _value, string _reference) checkSigned(sha3(msg.data))  returns(bool) {
        if (allowance(_from, tx.origin) < _value) {
            return false;
        }
        if (!_transfer(_from, _to, _value, _reference)) {
            return false;
        }
        uint pos = _getPosHolder(_from);
        uint posSpender = _getPosHolder(tx.origin);
        wallets[pos].allowance[posSpender] -= _value;
        return true;   
    }
}