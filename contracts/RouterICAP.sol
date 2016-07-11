import "Safe.sol";
import "RegistryICAP.sol";

contract Emitter {
    function emitTransferToICAP(address _from, address _to, bytes32 _icap, uint _value, string _reference);
    function emitError(bytes32 _message);
}

contract RouterICAP is Safe {
    RegistryICAP public registryICAP;
    Emitter public eventsHistory;

    function _error(bytes32 _message) internal {
        eventsHistory.emitError(_message);
    }

    function setupRegistryICAP(address _registryICAP) noValue() immutable(address(registryICAP)) returns(bool) {
        registryICAP = RegistryICAP(_registryICAP);
        return true;
    }

    function setupEventsHistory(address _eventsHistory) noValue() immutable(address(eventsHistory)) returns(bool) {
        eventsHistory = Emitter(_eventsHistory);
        return true;
    }

    function transfer(bytes32 _icap, string _reference) returns(bool) {
        var (to, _symbol, success) = registryICAP.parse(_icap);
        if (!success) {
            return _safeFalse();
        }
        if (!_unsafeSend(to, msg.value)) {
            _error("Exception on receiver contract");
            return _safeFalse();
        }
        eventsHistory.emitTransferToICAP(msg.sender, to, _icap, msg.value, _reference);
        return true;
    }

    function transferToICAP(bytes32 _icap) returns(bool) {
        return transferToICAPWithReference(_icap, "");
    }

    function transferToICAP(bytes32 _icap, uint _value) returns(bool) {
        return transferToICAPWithReference(_icap, _value, "");
    }

    function transferToICAPWithReference(bytes32 _icap, string _reference) returns(bool) {
        return transfer(_icap, _reference);
    }

    function transferToICAPWithReference(bytes32 _icap, uint _value, string _reference) returns(bool) {
        if (msg.value != _value) {
            _error("Values doesn't match");
            return _safeFalse();
        }
        return transferToICAPWithReference(_icap, _reference);
    }
}