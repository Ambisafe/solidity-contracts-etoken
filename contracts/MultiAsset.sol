import "Owned.sol";

contract Cosigner {
    function isSigned(bytes32) returns(bool);
    function confirm(bytes32 _opHash, address _account, uint _nonce, uint8 _v, bytes32 _r, bytes32 _s) returns(bool);
}

contract Proxy {
    function emitTransfer(address, address, uint);
    function emitApprove(address, address, uint);
}

contract RegistryICAP {
    function parse(bytes32) returns(address, bytes32, bool);
}

contract Switchable is Owned {
    mapping(bytes32 => bool) public switches;

    function isEnabled(bytes32 _switch) constant returns(bool) {
        // DEPLOY REMOVE `!`
        return !switches[_switch];// ! - means everything is enabled by default
    }

    function setSwitch(bytes32 _switch, bool _state) onlyContractOwner() returns(bool) {
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
    event TransferToICAP(address indexed from, address indexed to, bytes32 indexed icap, uint value, string reference);

    enum Features { Issue, TransferWithReference, Revoke, ChangeOwnership, Allowances, ICAP }

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
    mapping(bytes32 => ProxyConf) public proxies;

    RegistryICAP public registryICAP;

    function setup(address _registryICAP) onlyContractOwner() returns(bool) {
        registryICAP = RegistryICAP(_registryICAP);
        return true;
    }

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

    function _isSignedOwner(bytes32 _symbol) internal checkSigned(_symbol, getHolderId(msg.sender)) returns(bool) {
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
        return _balanceOf(getHolderId(_holder), _symbol);
    }

    function _balanceOf(uint _posHolder, bytes32 _symbol) constant internal returns(uint) {
        return assets[_symbol].wallets[_posHolder].balance;
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
        if (_only && balanceOf(msg.sender, _symbol) != totalSupply(_symbol)) { // Allow turning on onlyProxy for assets without holders only.
            return false;
        }
        proxies[_symbol].onlyProxy = _only;
        return true;
    }

    function _proxyCheck(bytes32 _symbol) internal constant returns(bool) {
        return proxies[_symbol].onlyProxy && !proxies[_symbol].isProxy[msg.sender];
    }

    function _transferDirect(uint _posFrom, uint _posTo, uint _value, bytes32 _symbol, string _reference) internal returns(bool) {
        assets[_symbol].wallets[_posFrom].balance -= _value;
        assets[_symbol].wallets[_posTo].balance += _value;
        Transfer(_address(_posFrom), _address(_posTo), _symbol, _value, _reference);
        _proxyTransferEvent(_posFrom, _posTo, _value, _symbol);
        return true;
    }

    function _transfer(uint _posFrom, uint _posTo, uint _value, bytes32 _symbol, string _reference, uint _posSender) internal checkSigned(_symbol, _posSender) returns(bool) {
        if (_proxyCheck(_symbol)) {
            return false;
        }
        if (_posFrom == _posTo) {
            return false;
        }
        if (_value < 1 || _balanceOf(_posFrom, _symbol) < _value) {
            return false;
        }
        if (bytes(_reference).length > 0 && !isEnabled(sha3(_symbol, Features.TransferWithReference))) {
            return false;
        }
        if (_posFrom != _posSender && _allowance(_posFrom, _posSender, _symbol) < _value) {
            return false;
        }
        if(!_transferDirect(_posFrom, _posTo, _value, _symbol, _reference)) {
            return false;
        }
        if (_posFrom != _posSender) {
            assets[_symbol].wallets[_posFrom].allowance[_posSender] -= _value;
        }
        return true;
    }

    function transfer(address _to, uint _value, bytes32 _symbol) returns(bool) {
        return transferWithReference(_to, _value, _symbol, "");
    }

    function transferToICAP(bytes32 _icap, uint _value) returns(bool) {
        return transferToICAPWithReference(_icap, _value, "");
    }

    function transferToICAPWithReference(bytes32 _icap, uint _value, string _reference) returns(bool) {
        return _transferToICAPWithReference(msg.sender, _icap, _value, _reference, msg.sender);
    }

    // Feature and proxy checks done internally due to unknown symbol when the function is called.
    function _transferToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference, address _sender) internal returns(bool) {
        var (to, symbol, success) = registryICAP.parse(_icap);
        if (!success) {
            return false;
        }
        if (!isEnabled(sha3(symbol, Features.ICAP))) {
            return false;
        }
        if (msg.sender != _sender && !proxies[symbol].isProxy[msg.sender]) {
            return false;
        }
        uint posFrom = getHolderId(_from);
        uint posTo = _createPosHolder(to);
        if (!_transfer(posFrom, posTo, _value, symbol, _reference, getHolderId(_sender))) {
            return false;
        }
        TransferToICAP(_address(posFrom), _address(posTo), _icap, _value, _reference);
        return true;
    }

    function transferWithReference(address _to, uint _value, bytes32 _symbol, string _reference) returns(bool) {
        return _transfer(getHolderId(msg.sender), _createPosHolder(_to), _value, _symbol, _reference, getHolderId(msg.sender));
    }

    function proxyTransferWithReference(address _to, uint _value, bytes32 _symbol, string _reference) onlyProxy(_symbol) returns(bool) {
        return _transfer(getHolderId(tx.origin), _createPosHolder(_to), _value, _symbol, _reference, getHolderId(tx.origin));
    }

    function proxyTransferToICAPWithReference(bytes32 _icap, uint _value, string _reference) returns(bool) {
        return _transferToICAPWithReference(tx.origin, _icap, _value, _reference, tx.origin);
    }

    function _proxyTransferEvent(uint _posFrom, uint _posTo, uint _value, bytes32 _symbol) internal returns(bool) {
        if (address(proxies[_symbol].proxy) != 0x0) {
            proxies[_symbol].proxy.emitTransfer(_address(_posFrom), _address(_posTo), _value);
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
        _proxyTransferEvent(0, pos, _value, _symbol);
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
        _proxyTransferEvent(pos, 0, _value, _symbol);
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
    
    function recover(address _from, address _to) checkSignedHolder(getHolderId(_from)) checkTrust(_from, msg.sender) returns(bool) {
        if (getHolderId(_to) != 0) {
            return false;
        }
        address from = holders[getHolderId(_from)].addr;
        holders[getHolderId(_from)].addr = _to;
        holderIndex[_to] = getHolderId(_from);
        Recovery(from, _to, msg.sender);
        return true;
    }

    function _approve(uint _posSpender, uint _value, bytes32 _symbol, uint _posSender) internal checkEnabledSwitch(sha3(_symbol, Features.Allowances)) checkSigned(_symbol, _posSender) returns(bool) {
        if (_proxyCheck(_symbol)) {
            return false;
        }
        if (!isCreated(_symbol)) {
            return false;
        }
        if (_posSender == _posSpender) {
            return false;
        }
        assets[_symbol].wallets[_posSender].allowance[_posSpender] = _value;
        Approve(_address(_posSender), _address(_posSpender), _symbol, _value);
        if (address(proxies[_symbol].proxy) != 0x0) {
            proxies[_symbol].proxy.emitApprove(_address(_posSender), _address(_posSpender), _value);
        }
        return true;
    }

    function approve(address _spender, uint _value, bytes32 _symbol) returns(bool) {
        return _approve(_createPosHolder(_spender), _value, _symbol, _createPosHolder(msg.sender));
    }

    function proxyApprove(address _spender, uint _value, bytes32 _symbol) onlyProxy(_symbol) returns(bool) {
        return _approve(_createPosHolder(_spender), _value, _symbol, _createPosHolder(tx.origin));
    }

    function allowance(address _from, address _spender, bytes32 _symbol) constant returns(uint) {
        return _allowance(getHolderId(_from), getHolderId(_spender), _symbol);
    }

    function _allowance(uint _posFrom, uint _posTo, bytes32 _symbol) constant internal returns(uint) {
        return assets[_symbol].wallets[_posFrom].allowance[_posTo];
    }

    function transferFrom(address _from, address _to, uint _value, bytes32 _symbol) returns(bool) {
        return transferFromWithReference(_from, _to, _value, _symbol, "");
    }

    function transferFromWithReference(address _from, address _to, uint _value, bytes32 _symbol, string _reference) returns(bool) {
        return _transfer(getHolderId(_from), _createPosHolder(_to), _value, _symbol, _reference, getHolderId(msg.sender));
    }

    function transferFromToICAP(address _from, bytes32 _icap, uint _value) returns(bool) {
        return transferFromToICAPWithReference(_from, _icap, _value, "");
    }

    function transferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) returns(bool) {
        return _transferToICAPWithReference(_from, _icap, _value, _reference, msg.sender);
    }

    function proxyTransferFromWithReference(address _from, address _to, uint _value, bytes32 _symbol, string _reference) onlyProxy(_symbol) returns(bool) {
        return _transfer(getHolderId(_from), _createPosHolder(_to), _value, _symbol, _reference, getHolderId(tx.origin));
    }

    function proxyTransferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) returns(bool) {
        return _transferToICAPWithReference(_from, _icap, _value, _reference, tx.origin);
    }

    mapping(bytes32 => Cosigner) cosigners;
    uint public signChecks; // DEPLOY REMOVE
    bytes32 public lastOperation; // DEPLOY REMOVE

    modifier checkSigned(bytes32 _symbol, uint _posSender) {
        signChecks++; // DEPLOY REMOVE
        lastOperation = sha3(msg.data, _posSender); // DEPLOY REMOVE
        bytes32 perUserPerAsset = sha3(_posSender, _symbol);
        bytes32 perUser = sha3(_posSender);
        if (address(cosigners[perUserPerAsset]) != 0x0) {
            if (cosigners[perUserPerAsset].isSigned(sha3(msg.data, _posSender))) {
                _
            }
        } else if (address(cosigners[perUser]) != 0x0) {
            if (cosigners[perUser].isSigned(sha3(msg.data, _posSender))) {
                _
            }
        } else {
            _
        }
    }

    modifier checkSignedHolder(uint _posSender) {
        signChecks++; // DEPLOY REMOVE
        lastOperation = sha3(msg.data, _posSender); // DEPLOY REMOVE
        bytes32 perUser = sha3(_posSender);
        if (address(cosigners[perUser]) != 0x0) {
            if (cosigners[perUser].isSigned(sha3(msg.data, _posSender))) {
                _
            }
        } else {
            _
        }
    }

    function setCosignerAddress(address _address, bytes32 _symbol) checkSigned(_symbol, getHolderId(msg.sender)) returns(bool) {
        return _setCosignerAddress(_address, sha3(_createPosHolder(msg.sender), _symbol));
    }

    function setCosignerAddressForUser(address _address) checkSignedHolder(getHolderId(msg.sender)) returns(bool) {
        return _setCosignerAddress(_address, sha3(_createPosHolder(msg.sender)));
    }

    function proxySetCosignerAddress(address _address, bytes32 _symbol) checkSigned(_symbol, getHolderId(tx.origin)) onlyProxy(_symbol) returns(bool) {
        return _setCosignerAddress(_address, sha3(_createPosHolder(tx.origin), _symbol));
    }

    function _setCosignerAddress(address _address, bytes32 _identity) internal returns(bool) {
        cosigners[_identity] = Cosigner(_address);
        return true;
    }

    function getCosignerAddress(bytes32 _identity) constant returns(address) {
        return address(cosigners[_identity]);
    }
}