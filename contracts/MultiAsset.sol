contract Cosigner {
    function isSigned(bytes32) returns(bool);
}

contract Proxy {
    function emitTransfer(address, address, uint);
    function emitApprove(address, address, uint);
}

contract Owned {
    address public contractOwner;

    function Owned() {
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
}

contract Switchable is Owned {
    mapping(bytes32 => bool) public switches;

    function isEnabled(bytes32 _switch) constant returns(bool) {
        return !switches[_switch];// ! - means everything is enabled by default
    }

    function setSwitch(bytes32 _switch, bool _state) onlyContractOwner() returns (bool) {
        switches[_switch] = _state;
        return _state;
    }

    modifier checkEnabledSwitch(bytes32 _switch) {
        if (isEnabled(_switch)) {
            _
        }
    }
}

contract MultiAsset is Switchable {

    event Transfer(address indexed from, address indexed to, bytes32 indexed symbol, uint value, string reference);
    event Issue(bytes32 indexed symbol, uint value, address by);
    event Revoke(bytes32 indexed symbol, uint value, address by);
    event OwnershipChange(address indexed from, address indexed to, bytes32 indexed symbol);
    event Approve(address indexed from, address indexed spender, bytes32 indexed symbol, uint value);
    event Recovery(address indexed from, address indexed to, address by);

    enum Features { Issue, TransferWithReference, Revoke, ChangeOwnership, Recovery, Allowances, Cosigning }
    
    struct Asset {
        uint owner;
        uint totalSupply;
        string name;
        string description;
        bool isReissuable;
        uint8 baseUnit;
        mapping(uint => Wallet) wallets;
    }

    struct ProxyConf {
        Proxy proxy;
        bool onlyProxy;
        mapping(address => bool) isProxy;
    }

    struct Wallet {
        uint balance;
        mapping(uint => uint) allowance;
    }

    struct Holder {
        uint trustsCount;
        address addr;
        mapping(uint => address) trusts;
        mapping(address => uint) trustIndex;
    }

    uint public holdersCount = 1;
    mapping(uint => Holder) holders;
    mapping(address => uint) holderIndex;
    mapping(bytes32 => Asset) public assets;
    mapping(bytes32 => ProxyConf) proxies;

    modifier onlyOwner(bytes32 _symbol) {
        if (_isSignedOwner(_symbol)) {
            _
        }
    }

    modifier onlyProxy(bytes32 _symbol) {
        if (proxies[_symbol].isProxy[msg.sender]) {
            _
        }
    }

    function _isSignedOwner(bytes32 _symbol) internal checkSigned(sha3(msg.data), _symbol, getHolderId(msg.sender)) returns(bool) {
        return isOwner(msg.sender, _symbol);
    }

    modifier checkTrust(address _from, address _to) {
        if (isTrusted(_from, _to)) {
            _
        }
    }

    function isCreated(bytes32 _symbol) constant returns(bool) {
        return assets[_symbol].owner != 0;
    }

    function baseUnit(bytes32 _symbol) constant returns(uint8) {
        return assets[_symbol].baseUnit;
    }

    function name(bytes32 _symbol) constant returns(string) {
        return assets[_symbol].name;
    }

    function description(bytes32 _symbol) constant returns(string) {
        return assets[_symbol].description;
    }

    function isReissuable(bytes32 _symbol) constant returns(bool) {
        return assets[_symbol].isReissuable;
    }

    function owner(bytes32 _symbol) constant returns(address) {
        return holders[assets[_symbol].owner].addr;
    }

    function isOwner(address _owner, bytes32 _symbol) constant returns(bool) {
        return isCreated(_symbol) && (assets[_symbol].owner == getHolderId(_owner));
    }

    function totalSupply(bytes32 _symbol) constant returns(uint) {
        return assets[_symbol].totalSupply;
    }

    function balanceOf(address _holder, bytes32 _symbol) constant returns(uint) {
        return assets[_symbol].wallets[getHolderId(_holder)].balance;
    }

    function _address(uint pos) constant internal returns(address) {
        return holders[pos].addr;
    }

    function setProxy(address _address, bool enabled, bytes32 _symbol) onlyOwner(_symbol) returns(bool) {
        proxies[_symbol].isProxy[_address] = enabled;
        return true;
    }

    function setEventsProxy(address _address, bytes32 _symbol) onlyOwner(_symbol) returns(bool) {
        proxies[_symbol].proxy = Proxy(_address);
        return true;
    }

    function setOnlyProxy(bool _only, bytes32 _symbol) onlyOwner(_symbol) returns(bool) {
        proxies[_symbol].onlyProxy = _only;
        return true;
    }

    function proxyCheck(bytes32 _symbol) internal constant returns(bool) {
        return proxies[_symbol].onlyProxy && !proxies[_symbol].isProxy[msg.sender];
    }

    function _transfer(address _from, address _to, uint _value, bytes32 _symbol, string _reference, address _sender) internal checkSigned(sha3(msg.data), _symbol, getHolderId(_sender)) returns(bool) {
        if (proxyCheck(_symbol)) {
            return false;
        }
        if (_value < 1 || balanceOf(_from, _symbol) < _value) {
            return false;
        }
        uint posFrom = getHolderId(_from);
        uint posTo = _createPosHolder(_to);
        if (posFrom == posTo) {
            return false;
        }
        assets[_symbol].wallets[posFrom].balance -= _value;
        assets[_symbol].wallets[posTo].balance += _value;
        Transfer(_address(posFrom), _address(posTo), _symbol, _value, _reference);
        proxyTransferEvent(_address(posFrom), _address(posTo), _value, _symbol);
        return true;
    }

    function transferWithReference(address _to, uint _value, bytes32 _symbol, string _reference) checkEnabledSwitch(sha3(_symbol, Features.TransferWithReference)) returns(bool) {
        return _transfer(msg.sender, _to, _value, _symbol, _reference, msg.sender);
    }

    function transfer(address _to, uint _value, bytes32 _symbol) returns(bool) {
        return _transfer(msg.sender, _to, _value, _symbol, "", msg.sender);
    }

    function proxyTransfer(address _to, uint _value, bytes32 _symbol, address _sender) onlyProxy(_symbol) returns(bool) {
        return _transfer(_sender, _to, _value, _symbol, "", _sender);
    }

    function proxyTransferEvent(address _from, address _to, uint _value, bytes32 _symbol) internal returns(bool) {
        if (address(proxies[_symbol].proxy) != 0x0) {
            proxies[_symbol].proxy.emitTransfer(_from, _to, _value);
        }
    }

    function getHolderId(address _holder) constant returns(uint) {
        return holderIndex[_holder];
    }

    function _createPosHolder(address _holder) internal returns(uint) {
        uint posHolder = holderIndex[_holder];
        if (posHolder == 0) {
            posHolder = holdersCount++;
            holders[posHolder].addr = _holder;
            holders[posHolder].trustsCount = 1;
            holderIndex[_holder] = posHolder;
        }
        return posHolder;
    }

    function issueAsset(bytes32 _symbol, uint _value, string _name, string _description, uint8 _baseUnit, bool _isReissuable) checkEnabledSwitch(sha3(_symbol, _isReissuable, Features.Issue)) returns(bool) {
        if (_value < 1 && !_isReissuable) {
            return false;
        }
        if (isCreated(_symbol)) {
            return false;
        }
        uint posHolder = _createPosHolder(msg.sender);

        assets[_symbol] = Asset(posHolder, _value, _name, _description, _isReissuable, _baseUnit);
        assets[_symbol].wallets[posHolder].balance = _value;
        Issue(_symbol, _value, _address(posHolder));
        return true;
    }
    
    function reissueAsset(bytes32 _symbol, uint _value) onlyOwner(_symbol) returns(bool) {
        if (_value < 1) {
            return false;
        }
        Asset asset = assets[_symbol];
        if (!asset.isReissuable) {
            return false;
        }
        if (asset.totalSupply + _value < asset.totalSupply) {
            return false;
        }
        uint pos = getHolderId(msg.sender);
        asset.wallets[pos].balance += _value;
        asset.totalSupply += _value;
        Issue(_symbol, _value, _address(pos));
        proxyTransferEvent(0x0, _address(pos), _value, _symbol);
        return true;
    }
    
    function revokeAsset(bytes32 _symbol, uint _value) checkEnabledSwitch(sha3(_symbol, Features.Revoke)) onlyOwner(_symbol) returns(bool) {
        if (_value < 1) {
            return false;
        }
        Asset asset = assets[_symbol];
        uint pos = getHolderId(msg.sender);
        if (asset.wallets[pos].balance < _value) {
            return false;
        }
        asset.wallets[pos].balance -= _value;
        asset.totalSupply -= _value;
        Revoke(_symbol, _value, _address(pos));
        proxyTransferEvent(_address(pos), 0x0, _value, _symbol);
        return true;
    }

    function changeOwnership(bytes32 _symbol, address _newOwner) checkEnabledSwitch(sha3(_symbol, Features.ChangeOwnership)) onlyOwner(_symbol) returns(bool) {
        Asset asset = assets[_symbol];
        uint posNewOwner = _createPosHolder(_newOwner);
        if (asset.owner == posNewOwner) {
            return false;
        }
        address oldOwner = _address(asset.owner);
        asset.owner = posNewOwner;
        OwnershipChange(oldOwner, _address(posNewOwner), _symbol);
        return true;
    }

    function isTrusted(address _from, address _to) constant returns(bool) {
        return holders[getHolderId(_from)].trustIndex[_to] != 0;
    }

    function trust(address _to) returns(bool) {
        uint posFrom = _createPosHolder(msg.sender);
        if (posFrom == getHolderId(_to)) {
            return false;
        }
        if (isTrusted(msg.sender, _to)) {
            return false;
        }
        uint trustPos = holders[posFrom].trustsCount++;
        holders[posFrom].trustIndex[_to] = trustPos;
        holders[posFrom].trusts[trustPos] = _to;
        return true;
    }

    function distrust(address _to) checkTrust(msg.sender, _to) returns(bool) {
        uint posFrom = getHolderId(msg.sender);
        uint trustPos = holders[posFrom].trustIndex[_to];
        if (trustPos < holders[posFrom].trustsCount-1) {
            address last = holders[posFrom].trusts[holders[posFrom].trustsCount-1];
            holders[posFrom].trusts[trustPos] = last;
            holders[posFrom].trustIndex[last] = trustPos; 
        }
        delete holders[posFrom].trusts[--holders[posFrom].trustsCount];
        delete holders[posFrom].trustIndex[_to];
        return true;
    }

    function distrustAll() returns(bool) {
        uint posFrom = getHolderId(msg.sender);
        if (posFrom == 0) {
            return false;
        }
        if (holders[posFrom].trustsCount == 1) {
            return false;
        }
        for (uint i = 1; i < holders[posFrom].trustsCount; i++) {
            address j = holders[posFrom].trusts[i];
            delete holders[posFrom].trustIndex[j];
            delete holders[posFrom].trusts[i];
        }
        holders[posFrom].trustsCount = 1;
        return true;
    }
    
    function recover(address _from, address _to) checkEnabledSwitch(sha3(getHolderId(_from), Features.Recovery)) checkSignedHolder(sha3(msg.data), getHolderId(_from)) checkTrust(_from, msg.sender) returns(bool) {
        if (getHolderId(_to) != 0) {
            return false;
        }
        address from = holders[getHolderId(_from)].addr;
        holders[getHolderId(_from)].addr = _to;
        holderIndex[_to] = getHolderId(_from);
        Recovery(from, _to, msg.sender);
        return true;
    }

    function _approve(address _spender, uint _value, bytes32 _symbol, address _sender) internal checkEnabledSwitch(sha3(_symbol, Features.Allowances)) checkSigned(sha3(msg.data), _symbol, getHolderId(_sender)) returns(bool) {
        if (proxyCheck(_symbol)) {
            return false;
        }
        if (!isCreated(_symbol)) {
            return false;
        }
        uint posFrom = _createPosHolder(_sender);
        uint posTo = _createPosHolder(_spender);
        if (posFrom == posTo) {
            return false;
        }
        assets[_symbol].wallets[posFrom].allowance[posTo] = _value;
        Approve(_address(posFrom), _address(posTo), _symbol, _value);
        if (address(proxies[_symbol].proxy) != 0x0) {
            proxies[_symbol].proxy.emitApprove(_sender, _spender, _value);
        }
        return true;
    }

    function approve(address _spender, uint _value, bytes32 _symbol) returns(bool) {
        return _approve(_spender, _value, _symbol, msg.sender);
    }

    function proxyApprove(address _spender, uint _value, bytes32 _symbol, address _sender) onlyProxy(_symbol) returns(bool) {
        return _approve(_spender, _value, _symbol, _sender);
    }

    function allowance(address _from, address _spender, bytes32 _symbol) constant returns(uint) {
        return assets[_symbol].wallets[getHolderId(_from)].allowance[getHolderId(_spender)];
    }

    function transferFrom(address _from, address _to, uint _value, bytes32 _symbol) returns(bool) {
        return _transferFromWithReference(_from, _to, _value, _symbol, "", msg.sender);
    }

    function transferFromWithReference(address _from, address _to, uint _value, bytes32 _symbol, string _reference) checkEnabledSwitch(sha3(_symbol, Features.TransferWithReference)) returns(bool) {
        return _transferFromWithReference(_from, _to, _value, _symbol, _reference, msg.sender);
    }

    function _transferFromWithReference(address _from, address _to, uint _value, bytes32 _symbol, string _reference, address _spender) internal returns(bool) {
        if (allowance(_from, _spender, _symbol) < _value) {
            return false;
        }
        if (!_transfer(_from, _to, _value, _symbol, _reference, _spender)) {
            return false;
        }
        assets[_symbol].wallets[getHolderId(_from)].allowance[getHolderId(_spender)] -= _value;
        return true;
    }

    function proxyTransferFrom(address _from, address _to, uint _value, bytes32 _symbol, address _sender) onlyProxy(_symbol) returns(bool) {
        return _transferFromWithReference(_from, _to, _value, _symbol, "", _sender);
    }

    mapping(bytes32 => Cosigner) cosigners;
    uint public signChecks; // DEPLOY REMOVE
    bytes32 public lastOperation; // DEPLOY REMOVE

    modifier checkSigned(bytes32 _opHash, bytes32 _symbol, uint _posSender) {
        signChecks++; // DEPLOY REMOVE
        lastOperation = sha3(_opHash, _posSender); // DEPLOY REMOVE
        bytes32 perUser = sha3(_posSender);
        bytes32 perUserPerAsset = sha3(_posSender, _symbol);
        if (address(cosigners[_symbol]) != 0x0) {
            if (cosigners[_symbol].isSigned(sha3(_opHash, _posSender))) {
                _
            }
        } else if (address(cosigners[perUserPerAsset]) != 0x0) {
            if (cosigners[perUserPerAsset].isSigned(sha3(_opHash, _posSender))) {
                _
            }
        } else if (address(cosigners[perUser]) != 0x0) {
            if (cosigners[perUser].isSigned(sha3(_opHash, _posSender))) {
                _
            }
        } else {
            _
        }
    }

    modifier checkSignedHolder(bytes32 _opHash, uint _posSender) {
        signChecks++; // DEPLOY REMOVE
        lastOperation = sha3(_opHash, _posSender); // DEPLOY REMOVE
        bytes32 perUser = sha3(_posSender);
        if (address(cosigners[perUser]) != 0x0) {
            if (cosigners[perUser].isSigned(sha3(_opHash, _posSender))) {
                _
            }
        } else {
            _
        }
    }

    function setCosignerAddress(address _address, bytes32 _symbol) checkEnabledSwitch(sha3(getHolderId(msg.sender), Features.Cosigning)) checkSigned(sha3(msg.data), _symbol, getHolderId(msg.sender)) returns(bool) {
        return _setCosignerAddress(_address, sha3(_createPosHolder(msg.sender), _symbol));
    }

    function setCosignerAddressForAsset(address _address, bytes32 _symbol) checkEnabledSwitch(sha3(_symbol, Features.Cosigning)) onlyOwner(_symbol) returns(bool) {
        return _setCosignerAddress(_address, _symbol);
    }

    function setCosignerAddressForUser(address _address) checkEnabledSwitch(sha3(getHolderId(msg.sender), Features.Cosigning)) checkSignedHolder(sha3(msg.data), getHolderId(msg.sender)) returns(bool) {
        return _setCosignerAddress(_address, sha3(_createPosHolder(msg.sender)));
    }

    function _setCosignerAddress(address _address, bytes32 _identity) internal returns(bool) {
        cosigners[_identity] = Cosigner(_address);
        return true;
    }
}