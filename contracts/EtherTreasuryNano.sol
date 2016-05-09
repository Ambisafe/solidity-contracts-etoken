import "EtherTreasuryInterface.sol";

// DEPLOY REMOVE START
contract AmbiEnabled {
    modifier checkAccess(bytes32) {
        _
    }
}
// DEPLOY REMOVE END

contract EtherTreasuryNano is AmbiEnabled, EtherTreasuryInterface {
    mapping(address => bool) public hasAccess;

    modifier onlyAccess() {
        if (hasAccess[msg.sender]) {
            _
        }
    }

    function() returns(bool) {
        return deposit();
    }

    function deposit() returns(bool) {
        if (msg.value > 0) {
            return true;
        }
        return false;
    }

    function depositWithReference(string _reference) returns(bool) {
        if (msg.value > 0) {
            Deposit(msg.sender, msg.value, _reference);
        }
        return true;
    }

    function withdraw(address _to, uint _value) onlyAccess() returns(bool) {
        return _to.send(_value);
    }

    function withdrawWithReference(address _to, uint _value, string _reference) returns(bool) {
        if(!withdraw(_to, _value)) {
            return false;
        }
        Withdrawal(msg.sender, _to, _value, _reference);
        return true;
    }

    function addAddress(address _address) checkAccess("admin") returns(bool) {
        hasAccess[_address] = true;
        return true;
    }

    function removeAddress(address _address) checkAccess("admin") returns(bool) {
        hasAccess[_address] = false;
        return true;
    }

    event Deposit(address indexed from, uint value, string reference);
    event Withdrawal(address indexed from, address indexed to, uint value, string reference);
}