import "Asset.sol";
import "EtherTreasuryInterface.sol";

contract RouterICAPInterface {
    function transferToICAPWithReference(bytes32 _icap, string _reference) returns(bool);
}

contract WeiToken is Asset, EtherTreasuryInterface {
    bool private isWithdrawOrReissue = false;
    mapping(address => bool) public autoDeposit;

    function() {
        deposit(msg.sender);
    }
    
    function deposit(address _to) returns(bool) {
        return depositWithReference(_to, "Deposit");
    }

    function depositWithReference(address _to, string _reference) returns(bool) {
        if (msg.value == 0) {
            return false;
        }
        isWithdrawOrReissue = true;
        if (balanceOf(address(this)) >= msg.value || multiAsset.reissueAsset(symbol, msg.value)) {
            isWithdrawOrReissue = false;
            if (multiAsset.transferWithReference(_to, msg.value, symbol, _reference)) {
                return true;
            } else {
                return revokeAll();
            }
        } else {
            isWithdrawOrReissue = false;
            return _safeFalse();
        }
    }

    function setAutoDeposit(bool _enabled) returns(bool) {
        autoDeposit[msg.sender] = _enabled;
        return true;
    }

    function isAutoDepositICAP(bytes32 _icap) constant returns(bool) {
        return isAutoDeposit(multiAsset.registryICAP().institutions(_institutionHash(_icap)));
    }

    function isAutoDeposit(address _to) constant returns(bool) {
        // DEPLOY REMOVE `!`
        return !autoDeposit[_to];
    }

    function _institutionHash(bytes32 _icap) internal constant returns(bytes32) {
        return sha3(_icap[4], _icap[5], _icap[6], _icap[7], _icap[8], _icap[9], _icap[10]);
    }

    function _sendEther(address _to, uint _value) internal {
        _safeSend(_to, _value);
    }

    function _sendEtherToICAPWithReference(bytes32 _icap, uint _value, string _reference) internal {
        if (!RouterICAPInterface(getAddress("router")).transferToICAPWithReference.value(_value)(_icap, _reference)) {
            throw;
        }
    }
    
    function withdraw(address _to, uint _value) returns(bool) {
        return withdrawWithReference(_to, _value, "");
    }

    function withdrawWithReference(address _to, uint _value, string _reference) noValue() returns(bool) {
        return _withdrawWithReference(_to, _value, _reference);
    }

    function _withdrawWithReference(address _to, uint _value, string _reference) internal returns(bool) {
        if (isAutoDeposit(_to) && msg.sender != _to) {
            return _isHuman() ?
                multiAsset.proxyTransferWithReference(_to, _value, symbol, _reference) :
                multiAsset.transferFromWithReference(msg.sender, _to, _value, symbol, _reference);
        }
        bool success = _prepareWithdraw(_value, _reference);
        if (success) {
            _sendEther(_to, _value);
        }
        return success;
    }

    function withdrawToICAPWithReference(bytes32 _icap, uint _value, string _reference) noValue() returns(bool) {
        return _withdrawToICAPWithReference(_icap, _value, _reference);
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
        isWithdrawOrReissue = true;
        bool success = _isHuman() ?
            multiAsset.proxyTransferWithReference(address(this), _value, symbol, _reference) :
            multiAsset.transferFromWithReference(msg.sender, address(this), _value, symbol, _reference);
        isWithdrawOrReissue = false;
        return success;
    }

    function _prepareWithdrawFrom(address _from, uint _value, string _reference) internal returns(bool) {
        isWithdrawOrReissue = true;
        bool success = multiAsset.proxyTransferFromWithReference(_from, address(this), _value, symbol, _reference);
        isWithdrawOrReissue = false;
        return success;
    }

    function revokeAll() noValue() returns(bool) {
        return multiAsset.revokeAsset(symbol, balanceOf(address(this)));
    }

    function init(address _multiAsset, bytes32 _symbol) noValue() returns(bool) {
        if (address(multiAsset) != 0x0) {
            return false;
        }
        var mAsset = MultiAsset(_multiAsset);
        if (!mAsset.issueAsset(_symbol, 0, "WeiToken", "1-to-1 with wei.", 0, true)) {
            // DEPLOY REMOVE START
            if (isAutoDeposit(0x0)) {
                multiAsset = mAsset;
                symbol = _symbol;
            }
            // DEPLOY REMOVE END
            return false;
        }
        if(mAsset.setProxy(address(this), true, _symbol) && mAsset.setEventsProxy(address(this), _symbol) && mAsset.setProxyConf(false, true, _symbol)) {
            multiAsset = mAsset;
            symbol = _symbol;
            return true;
        }
        throw;
    }

    function transferWithReference(address _to, uint _value, string _reference) returns(bool) {
        deposit(msg.sender);
        // DEPLOY REMOVE START
        if (msg.sender == _to && this.balance < _value) return false;
        // DEPLOY REMOVE END
        return _withdrawWithReference(_to, _value, _reference);
    }

    function transferFromWithReference(address _from, address _to, uint _value, string _reference) noValue() onlyHuman() returns(bool) {
        if (isAutoDeposit(_to)) {
            return multiAsset.proxyTransferFromWithReference(_from, _to, _value, symbol, _reference);
        }
        bool success = _prepareWithdrawFrom(_from, _value, _reference);
        if (success) {
            _sendEther(_to, _value);
        }
        return success;
    }

    function transferToICAPWithReference(bytes32 _icap, uint _value, string _reference) returns(bool) {
        deposit(msg.sender);
        return _withdrawToICAPWithReference(_icap, _value, _reference);
    }

    function transferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) noValue() onlyHuman() returns(bool) {
        if (isAutoDepositICAP(_icap)) {
            return multiAsset.proxyTransferFromToICAPWithReference(_from, _icap, _value, _reference);
        }
        bool success = _prepareWithdrawFrom(_from, _value, _reference);
        if (success) {
            _sendEtherToICAPWithReference(_icap, _value, _reference);
        }
        return success;
    }

    function emitTransfer(address _from, address _to, uint _value) {
        super.emitTransfer(_from, _to, _value);
        if (_to == address(this)) {
            if (!isWithdrawOrReissue) {
                throw;
            }
        }
        if (!isAutoDeposit(_to)) {
            throw;
        }
    }

    function sendToOwner() noValue() returns(bool) {
        return true;
    }
}