pragma solidity ^0.4.4;

import "SafeMin.sol";

contract RegistryICAP {
    function institutions(bytes32 _id) constant returns(address);
}

contract RouterICAPInterface {
    function transferToICAPWithReference(bytes32 _icap, string _reference) payable returns(bool);
}

contract MultiAsset {
    function issueAsset(bytes32 _symbol, uint _value, string _name, string _description, uint8 _baseUnit, bool _isReissuable) returns(bool);
    function setProxy(address _address, bool enabled, bytes32 _symbol) returns(bool);
    function setEventsProxy(address _address, bytes32 _symbol) returns(bool);
    function setProxyConf(bool _onlyThroughProxy, bool _throwOnFailedEmit, bytes32 _symbol) returns(bool);
    function registryICAP() constant returns(RegistryICAP);
    function totalSupply(bytes32 _symbol) constant returns(uint);
    function balanceOf(address _holder, bytes32 _symbol) constant returns(uint);
    function reissueAsset(bytes32 _symbol, uint _value) returns(bool);
    function allowance(address _from, address _spender, bytes32 _symbol) constant returns(uint);
    function transferWithReference(address _to, uint _value, bytes32 _symbol, string _reference) returns(bool);
    function transferFromWithReference(address _from, address _to, uint _value, bytes32 _symbol, string _reference) returns(bool);
    function transferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) returns(bool);
    function proxyTransferWithReference(address _to, uint _value, bytes32 _symbol, string _reference) returns(bool);
    function proxyTransferToICAPWithReference(bytes32 _icap, uint _value, string _reference) returns(bool);
    function proxyApprove(address _spender, uint _value, bytes32 _symbol) returns(bool);
    function proxyTransferFromWithReference(address _from, address _to, uint _value, bytes32 _symbol, string _reference) returns(bool);
    function proxyTransferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) returns(bool);
    function proxySetCosignerAddress(address _address, bytes32 _symbol) returns(bool);
}

contract ETokenETH is SafeMin {
    event Transfer(address indexed from, address indexed to, uint value);
    event Approve(address indexed from, address indexed spender, uint value);

    MultiAsset public multiAsset;
    bytes32 public symbol;
    string public constant name = "ETokenETH";
    uint8 public constant decimals = 18;

    modifier onlyMultiAsset() {
        if (msg.sender == address(multiAsset)) {
            _;
        }
    }

    function totalSupply() constant returns(uint) {
        return multiAsset.totalSupply(symbol);
    }

    function balanceOf(address _owner) constant returns(uint) {
        return multiAsset.balanceOf(_owner, symbol);
    }

    function allowance(address _from, address _spender) constant returns(uint) {
        return multiAsset.allowance(_from, _spender, symbol);
    }

    function approve(address _spender, uint _value) onlyHuman() topup() returns(bool) {
        return multiAsset.proxyApprove(_spender, _value, symbol);
    }

    function setCosignerAddress(address _cosigner) onlyHuman() topup() returns(bool) {
        return multiAsset.proxySetCosignerAddress(_cosigner, symbol);
    }

    function emitApprove(address _from, address _spender, uint _value) onlyMultiAsset() {
        Approve(_from, _spender, _value);
    }

    bool private __isWithdrawOrReissue = false;
    bool private __isDeposit = false;
    mapping(address => bool) autoDeposit;
    mapping(address => bool) autoTopupDisabled;
    uint public constant autoTopupThreshold = 0.01 ether;
    uint public constant autoTopupAmount = 0.1 ether;

    RouterICAPInterface public routerICAP;

    modifier topup() {
        _;
        if (autoTopupDisabled[msg.sender] || _isContract() || msg.sender.balance >= autoTopupThreshold) {
            return;
        }
        _withdrawWithReference(msg.sender, autoTopupAmount, "Topup");
    }

    modifier withValue() {
        if (msg.value > 0) {
            _;
        }
    }

    function setupRouterICAP(address _routerICAP) immutable(address(routerICAP)) returns(bool) {
        routerICAP = RouterICAPInterface(_routerICAP);
        return true;
    }

    function () payable {
        deposit(msg.sender);
    }
    
    function deposit(address _to) payable topup() returns(bool) {
        return _deposit(_to);
    }

    function _deposit(address _to) internal withValue() returns(bool) {
        if (_to == address(this)) {
            return _safeFalse();
        }
        uint balance = balanceOf(address(this));
        if (balance >= msg.value || _reissue(msg.value - balance)) {
            __isDeposit = true;
            bool transfer = multiAsset.transferWithReference(_to, msg.value, symbol, "Deposit");
            __isDeposit = false;
            return transfer || _safeFalse();
        }
        return _safeFalse();
    }

    function _reissue(uint _value) internal returns(bool _success) {
        __isWithdrawOrReissue = true;
        _success = multiAsset.reissueAsset(symbol, _value);
        __isWithdrawOrReissue = false;
    }

    function setAutoDeposit(bool _enabled) returns(bool) {
        autoDeposit[msg.sender] = _enabled;
        return true;
    }

    function setAutoTopup(bool _enabled) returns(bool) {
        autoTopupDisabled[msg.sender] = !_enabled;
        return true;
    }

    function isAutoDepositICAP(bytes32 _icap) constant returns(bool) {
        return isAutoDeposit(multiAsset.registryICAP().institutions(_institutionHash(_icap)));
    }

    function isAutoDeposit(address _to) constant returns(bool) {
        // DEPLOY REMOVE `!`
        return !autoDeposit[_to];
    }

    function isAutoTopup(address _to) constant returns(bool) {
        return !autoTopupDisabled[_to];
    }

    function _institutionHash(bytes32 _icap) internal constant returns(bytes32) {
        return sha3(_icap[4], _icap[5], _icap[6], _icap[7], _icap[8], _icap[9], _icap[10]);
    }

    function _sendEther(address _to, uint _value) internal {
        address receiver = (_to == address(this)) ? msg.sender : _to;
        _safeSend(receiver, _value);
    }

    function _sendEtherToICAPWithReference(bytes32 _icap, uint _value, string _reference) internal {
        if (!routerICAP.transferToICAPWithReference.value(_value)(_icap, _reference)) {
            throw;
        }
    }
    
    function _transfer(address _to, uint _value, string _reference) internal returns(bool) {
        return _isHuman() ?
            multiAsset.proxyTransferWithReference(_to, _value, symbol, _reference) :
            multiAsset.transferFromWithReference(msg.sender, _to, _value, symbol, _reference);
    }
    
    function _transferFrom(address _from, address _to, uint _value, string _reference) internal returns(bool) {
        return multiAsset.proxyTransferFromWithReference(_from, _to, _value, symbol, _reference);
    }

    function _withdrawWithReference(address _to, uint _value, string _reference) internal returns(bool) {
        if (isAutoDeposit(_to) && msg.sender != _to) {
            return _transfer(_to, _value, _reference);
        }
        bool success = _prepareWithdraw(_value, _reference);
        if (success) {
            _sendEther(_to, _value);
        }
        return success;
    }

    function _withdrawToICAPWithReference(bytes32 _icap, uint _value, string _reference) internal returns(bool) {
        if (isAutoDepositICAP(_icap)) {
            return _isHuman() ?
                multiAsset.proxyTransferToICAPWithReference(_icap, _value, _reference) :
                multiAsset.transferFromToICAPWithReference(msg.sender, _icap, _value, _reference);
        }
        bool success = _prepareWithdraw(_value, _reference);
        if (success) {
            _sendEtherToICAPWithReference(_icap, _value, _reference);
        }
        return success;
    }

    function _prepareWithdraw(uint _value, string _reference) internal returns(bool) {
        __isWithdrawOrReissue = true;
        bool success = _transfer(address(this), _value, _reference);
        __isWithdrawOrReissue = false;
        return success;
    }

    function _prepareWithdrawFrom(address _from, uint _value, string _reference) internal returns(bool) {
        __isWithdrawOrReissue = true;
        bool success = _transferFrom(_from, address(this), _value, _reference);
        __isWithdrawOrReissue = false;
        return success;
    }

    function init(address _multiAsset, bytes32 _symbol) immutable(address(multiAsset)) returns(bool) {
        var mAsset = MultiAsset(_multiAsset);
        if (!mAsset.issueAsset(_symbol, 0, name, "1-to-1 with wei.", decimals, true)) {
            // DEPLOY REMOVE START
            if (isAutoDeposit(0x0)) {
                multiAsset = mAsset;
                symbol = _symbol;
                autoDeposit[address(this)] = true;
                autoDeposit[0x0] = true;
            }
            // DEPLOY REMOVE END
            return false;
        }
        if (mAsset.setProxy(address(this), true, _symbol) && mAsset.setEventsProxy(address(this), _symbol) && mAsset.setProxyConf(false, true, _symbol)) {
            multiAsset = mAsset;
            symbol = _symbol;
            return true;
        }
        throw;
    }

    function transfer(address _to, uint _value) payable returns(bool) {
        return transferWithReference(_to, _value, "");
    }

    function transferWithReference(address _to, uint _value, string _reference) payable topup() returns(bool) {
        _deposit(msg.sender);
        // DEPLOY REMOVE START
        if (msg.sender == _to && this.balance < _value) return false;
        // DEPLOY REMOVE END
        return _withdrawWithReference(_to, _value, _reference);
    }

    function transferFrom(address _from, address _to, uint _value) returns(bool) {
        return transferFromWithReference(_from, _to, _value, "");
    }

    function transferFromWithReference(address _from, address _to, uint _value, string _reference) onlyHuman() topup() returns(bool) {
        if (isAutoDeposit(_to)) {
            return _transferFrom(_from, _to, _value, _reference);
        }
        if (!_prepareWithdrawFrom(_from, _value, _reference)) {
            return false;
        }
        _sendEther(_to, _value);
        return true;
    }

    function transferToICAP(bytes32 _icap, uint _value) payable returns(bool) {
        return transferToICAPWithReference(_icap, _value, "");
    }

    function transferToICAPWithReference(bytes32 _icap, uint _value, string _reference) payable topup() returns(bool) {
        _deposit(msg.sender);
        return _withdrawToICAPWithReference(_icap, _value, _reference);
    }

    function transferFromToICAP(address _from, bytes32 _icap, uint _value) returns(bool) {
        return transferFromToICAPWithReference(_from, _icap, _value, "");
    }

    function transferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) onlyHuman() topup() returns(bool) {
        if (isAutoDepositICAP(_icap)) {
            return multiAsset.proxyTransferFromToICAPWithReference(_from, _icap, _value, _reference);
        }
        if (!_prepareWithdrawFrom(_from, _value, _reference)) {
            return false;
        }
        _sendEtherToICAPWithReference(_icap, _value, _reference);
        return true;
    }

    function emitTransfer(address _from, address _to, uint _value) onlyMultiAsset() {
        if (_to == address(this)) {
            if (!__isWithdrawOrReissue) {
                throw;
            }
        } else if (!isAutoDeposit(_to) && !__isDeposit) {
            throw;
        }
        Transfer(_from, _to, _value);
    }
}
