import "EtherTreasuryInterface.sol";
import "AmbiEnabled.sol";
import "Safe.sol";

contract EtherTreasuryNanoApprovable is AmbiEnabled, EtherTreasuryInterface, Safe {
    mapping(address => bool) public hasAccess;
    mapping(address => bool) public approved;

    modifier allowed(address _to) {
        if (hasAccess[msg.sender] && approved[_to]) {
            _
        }
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

    function withdraw(address _to, uint _value) noValue() allowed(_to) returns(bool) {
        return _to.send(_value);
    }

    function withdrawWithReference(address _to, uint _value, string _reference) returns(bool) {
        if(!withdraw(_to, _value)) {
            return false;
        }
        Withdrawal(msg.sender, _to, _value, _reference);
        return true;
    }

    function addAddress(address _address) noValue() checkAccess("admin") returns(bool) {
        hasAccess[_address] = true;
        return true;
    }

    function removeAddress(address _address) noValue() checkAccess("admin") returns(bool) {
        hasAccess[_address] = false;
        return true;
    }

    function approve(address _address) noValue() checkAccess("approver") returns(bool) {
        approved[_address] = true;
        return true;
    }

    function deny(address _address) noValue() checkAccess("approver") returns(bool) {
        approved[_address] = false;
        return true;
    }

    event Deposit(address indexed from, uint value, string reference);
    event Withdrawal(address indexed from, address indexed to, uint value, string reference);
}