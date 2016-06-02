import "EtherTreasuryInterface.sol";
import "AmbiEnabled.sol";

contract EtherTreasuryNanoBillable is AmbiEnabled, EtherTreasuryInterface {
    mapping(address => bytes32) public subscriptions;
    mapping(bytes32 => bool) public statuses;

    function() returns(bool) {
        return deposit();
    }

    function deposit() returns(bool) {
        return depositWithReference("");
    }

    function depositWithReference(string _reference) returns(bool) {
        if (msg.value > 0) {
            Deposit(msg.sender, msg.value, _reference);
        }
        return true;
    }

    function withdraw(address _to, uint _value) returns(bool) {
        return withdrawWithReference(_to, _value, "");
    }

    function withdrawWithReference(address _to, uint _value, string _reference) returns(bool) {
        return _withdraw(_to, _value, subscriptions[msg.sender], _reference);
    }

    function withdrawBySubscription(address _to, uint _value, bytes32 _subscription, string _reference) checkAccess("faucet") returns(bool) {
        return _withdraw(_to, _value, _subscription, _reference);
    }

    function _withdraw(address _to, uint _value, bytes32 _subscription, string _reference) internal returns(bool) {
        if (!statuses[_subscription]) {
            return false;
        }
        if (!_to.send(_value)) {
            return false;
        }
        Withdrawal(msg.sender, _to, _subscription, _value, _reference);
        return true;
    }

    function subscribe(address _address, bytes32 _subscription) checkAccess("admin") returns(bool) {
        if (subscriptions[_address] != 0) {
            return false;
        }
        subscriptions[_address] = _subscription;
        return true;
    }

    function unsubscribe(address _address) checkAccess("admin") returns(bool) {
        if (subscriptions[_address] == 0) {
            return false;
        }
        delete subscriptions[_address];
        return true;
    }

    function setSubscriptionStatus(bool _status, bytes32 _subscription) checkAccess("admin") returns(bool) {
        statuses[_subscription] = _status;
        return true;
    }

    function freeze(bytes32 _subscription) returns(bool) {
        return setSubscriptionStatus(false, _subscription);
    }

    function unFreeze(bytes32 _subscription) returns(bool) {
        return setSubscriptionStatus(true, _subscription);
    }

    event Deposit(address indexed from, uint value, string reference);
    event Withdrawal(address indexed from, address indexed to, bytes32 indexed subscription, uint value, string reference);
}