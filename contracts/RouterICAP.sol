import "Safe.sol";
import "RegistryICAP.sol";

contract RouterICAP is Safe {
    event TransferToICAP(address indexed from, address indexed to, bytes32 indexed icap, uint value, string reference);
    event Error(uint8 indexed code, bytes32 message);

    RegistryICAP public registryICAP;

    function setupRegistryICAP(address _registryICAP) noValue() immutable(address(registryICAP)) returns(bool) {
        registryICAP = RegistryICAP(_registryICAP);
        return true;
    }

    function transfer(bytes32 _icap, string _reference) returns(bool) {
        var (to, _symbol, success) = registryICAP.parse(_icap);
        if (!success) {
            return _safeFalse();
        }
        if (!_unsafeSend(to, msg.value)) {
            Error(1, "Exception on receiver contract");
            return _safeFalse();
        }
        TransferToICAP(msg.sender, to, _icap, msg.value, _reference);
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
            Error(2, "Values doesn't match");
            return _safeFalse();
        }
        return transferToICAPWithReference(_icap, _reference);
    }
}