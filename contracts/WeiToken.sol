import "Asset.sol";
import "EtherTreasuryInterface.sol";
import "AmbiEnabled.sol";

contract RouterICAP {
    function transferToICAPWithReference(bytes32 _icap, string _reference) returns(bool);
}

contract WeiToken is AmbiEnabled, Asset, EtherTreasuryInterface {
    bool private isWithdraw = false;
    mapping(address => bool) public autoDeposit;
    mapping(bytes32 => bool) public autoDepositICAP;

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
        if (balanceOf(address(this)) >= msg.value || multiAsset.reissueAsset(symbol, msg.value)) {
            if (!multiAsset.transferWithReference(_to, msg.value, symbol, _reference)) {
                return safeFalse();
            }
        }
        return safeFalse();
    }

    function setAutoDeposit(bool _enabled) returns(bool) {
        autoDeposit[msg.sender] = _enabled;
        return true;
    }

    function setAutoDepositICAP(bytes32 _icap, bool _enabled) returns(bool) {
        var (_address, _symbol, _success) = multiAsset.registryICAP().parse(_icap);
        if (!_success) {
            return false;
        }
        if (_symbol != symbol) {
            return false;
        }
        if (_address != msg.sender) {
            return false;
        }
        autoDepositICAP[_institutionHash(_icap)] = _enabled;
        return true;
    }

    function isAutoDepositICAP(bytes32 _icap) constant returns(bool) {
        // DEPLOY REMOVE `!`
        return !autoDepositICAP[_institutionHash(_icap)];
    }

    function isAutoDeposit(address _to) constant returns(bool) {
        // DEPLOY REMOVE `!`
        return !autoDeposit[_to];
    }

    function _institutionHash(bytes32 _icap) internal constant returns(bytes32) {
        return sha3(_icap[7], _icap[8], _icap[9], _icap[10]);
    }

    function _withdraw(address _to, uint _value) internal {
        safeSend(_to, _value);
    }

    function _sendToICAPWithReference(bytes32 _icap, uint _value, string _reference) internal {
        if (!RouterICAP(getAddress("router")).transferToICAPWithReference.value(_value)(_icap, _reference)) {
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
            return isHuman() ?
                super.transferWithReference(_to, _value, _reference) :
                multiAsset.transferFromWithReference(msg.sender, _to, _value, symbol, _reference);
        }
        bool success = _prepareWithdraw(_value, _reference);
        if (success) {
            _withdraw(_to, _value);
        }
        return success;
    }

    function withdrawToICAPWithReference(bytes32 _icap, uint _value, string _reference) noValue() returns(bool) {
        return _withdrawToICAPWithReference(_icap, _value, _reference);
    }

    function _withdrawToICAPWithReference(bytes32 _icap, uint _value, string _reference) internal returns(bool) {
        if (isAutoDepositICAP(_icap)) {
            return isHuman() ?
                super.transferToICAPWithReference(_icap, _value, _reference) :
                multiAsset.transferFromToICAPWithReference(msg.sender, _icap, _value, _reference);
        }
        bool success = _prepareWithdraw(_value, _reference);
        if (success) {
            _sendToICAPWithReference(_icap, _value, _reference);
        }
        return success;
    }

    function _prepareWithdraw(uint _value, string _reference) internal returns(bool) {
        isWithdraw = true;
        bool success = isHuman() ?
            super.transferWithReference(address(this), _value, _reference) :
            multiAsset.transferFromWithReference(msg.sender, address(this), _value, symbol, _reference);
        isWithdraw = false;
        return success;
    }

    function _prepareWithdrawFrom(address _from, uint _value, string _reference) internal returns(bool) {
        isWithdraw = true;
        bool success = multiAsset.proxyTransferFromWithReference(_from, address(this), _value, symbol, _reference);
        isWithdraw = false;
        return success;
    }

    function revokeAll() noValue() returns(bool) {
        return multiAsset.revokeAsset(symbol, balanceOf(address(this)));
    }

    function init(address _multiAsset, bytes32 _symbol) noValue() returns(bool) {
        if (address(multiAsset) != 0x0) {
            return false;
        }
        multiAsset = MultiAsset(_multiAsset);
        symbol = _symbol;
        if (multiAsset.issueAsset(symbol, 0, "WeiToken", "1-to-1 with wei.", 0, true)
            && multiAsset.setProxy(address(this), true, symbol)
            && multiAsset.setEventsProxy(address(this), symbol))
        {
            return true;
        }
        return false;
    }

    function transferWithReference(address _to, uint _value, string _reference) returns(bool) {
        if (msg.value > 0) {
            deposit(msg.sender);
        }
        if (isAutoDeposit(_to)) {
            if (isContract()) {
                return multiAsset.transferFromWithReference(msg.sender, _to, _value, symbol, _reference);
            }
            return multiAsset.proxyTransferWithReference(_to, _value, symbol, _reference);
        }
        return _withdrawWithReference(_to, _value, _reference);
    }

    function transferFromWithReference(address _from, address _to, uint _value, string _reference) noValue() onlyHuman() returns(bool) {
        if (isAutoDeposit(_to)) {
            return multiAsset.proxyTransferFromWithReference(_from, _to, _value, symbol, _reference);
        }
        bool success = _prepareWithdrawFrom(_from, _value, _reference);
        if (success) {
            _withdraw(_to, _value);
        }
        return success;
    }

    function transferToICAPWithReference(bytes32 _icap, uint _value, string _reference) returns(bool) {
        if (msg.value > 0) {
            deposit(msg.sender);
        }
        if (isAutoDepositICAP(_icap)) {
            if (isContract()) {
                return multiAsset.transferFromToICAPWithReference(msg.sender, _icap, _value, _reference);
            }
            return multiAsset.proxyTransferToICAPWithReference(_icap, _value, _reference);
        }
        return _withdrawToICAPWithReference(_icap, _value, _reference);
    }

    function transferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) noValue() onlyHuman() returns(bool) {
        if (isAutoDepositICAP(_icap)) {
            return multiAsset.proxyTransferFromToICAPWithReference(_from, _icap, _value, _reference);
        }
        bool success = _prepareWithdrawFrom(_from, _value, _reference);
        if (success) {
            _sendToICAPWithReference(_icap, _value, _reference);
        }
        return success;
    }

    function emitTransfer(address _from, address _to, uint _value) {
        super.emitTransfer(_from, _to, _value);
        if (_to == address(this)) {
            if (!isWithdraw) {
                throw;
            }
        }
    }

    function sendToOwner() noValue() returns(bool) {
        return true;
    }
}