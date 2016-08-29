import "EtherTreasuryInterface.sol";
import "AmbiEnabled.sol";
import "Safe.sol";

contract EtherTreasuryApprovableProxy is AmbiEnabled, EtherTreasuryInterface, Safe {
    mapping(address => bool) public hasAccess;
    mapping(address => bool) public approved;
    EtherTreasuryInterface public treasury;

    modifier allowed(address _to) {
        if (hasAccess[msg.sender] && approved[_to]) {
            _
        }
    }

    function setupTreasury(address _treasury) noValue() checkAccess("admin") returns(bool) {
        treasury = EtherTreasuryInterface(_treasury);
        return true;
    }

    function withdraw(address _to, uint _value) returns(bool) {
        return withdrawWithReference(_to, _value, "");
    }

    function withdrawWithReference(address _to, uint _value, string _reference) noValue() allowed(_to) returns(bool) {
        return treasury.withdrawWithReference(_to, _value, _reference);
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

    function () noValue() {}
}
