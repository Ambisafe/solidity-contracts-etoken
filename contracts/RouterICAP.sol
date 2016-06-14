import "AmbiEnabled.sol";
import "Safe.sol";

contract RegistryICAP {
    function parse(bytes32) returns(address, bytes32, bool);
}

contract RouterICAP is AmbiEnabled, Safe {
    event Transfer(address indexed from, address indexed to, bytes32 indexed icap, uint value);

    RegistryICAP public registryICAP;

    function setup(address _registryICAP) noValue() checkAccess("admin") returns(bool) {
        registryICAP = RegistryICAP(_registryICAP);
        return true;
    }

    function transfer(bytes32 _icap) returns(bool) {
        // Asset should be ETH.
        if (_icap[4] != 69 || _icap[5] != 84 || _icap[6] != 72) {
            return false;
        }
        var (to, symbol, success) = registryICAP.parse(_icap);
        if (!success) {
            return false;
        }
        safeSend(to, msg.value);
        Transfer(msg.sender, to, _icap, msg.value);
        return true;
    }

    function transferToICAP(bytes32 _icap) returns(bool) {
        return transfer(_icap);
    }

    function transferToICAP(bytes32 _icap, uint _value) returns(bool) {
        if (msg.value != _value) {
            return false;
        }
        return transfer(_icap);
    }
}