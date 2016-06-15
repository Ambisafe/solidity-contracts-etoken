import "AmbiEnabled.sol";
import "Safe.sol";

contract RegistryICAP {
    function parse(bytes32) returns(address, bytes32, bool);
}

contract RouterICAP is AmbiEnabled, Safe {
    event TransferToICAP(address indexed from, address indexed to, bytes32 indexed icap, uint value, string reference);

    function transfer(bytes32 _icap, string _reference) returns(bool) {
        var (to, _symbol, success) = RegistryICAP(getAddress("icap")).parse(_icap);
        if (!success) {
            return safeFalse();
        }
        safeSend(to, msg.value);
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
            return safeFalse();
        }
        return transferToICAPWithReference(_icap, _reference);
    }
}