pragma solidity ^0.4.9;

import "EtherTreasuryInterface.sol";
import "Ambi2EnabledFull.sol";
import "SafeMin.sol";

contract EtherTreasuryApprovableProxy is Ambi2EnabledFull, EtherTreasuryInterface, SafeMin {
    mapping(address => bool) public hasAccess;
    mapping(address => bool) public approved;
    EtherTreasuryInterface public treasury;

    modifier allowed(address _to) {
        if (hasAccess[msg.sender] && approved[_to]) {
            _;
        }
    }

    function setupTreasury(EtherTreasuryInterface _treasury) onlyRole("admin") returns(bool) {
        treasury = _treasury;
        return true;
    }

    function withdraw(address _to, uint _value) returns(bool) {
        return withdrawWithReference(_to, _value, "");
    }

    function withdrawWithReference(address _to, uint _value, string _reference) allowed(_to) returns(bool) {
        return treasury.withdrawWithReference(_to, _value, _reference);
    }

    function addAddress(address _address) onlyRole("admin") returns(bool) {
        hasAccess[_address] = true;
        return true;
    }

    function removeAddress(address _address) onlyRole("admin") returns(bool) {
        hasAccess[_address] = false;
        return true;
    }

    function approve(address _address) onlyRole("approver") returns(bool) {
        approved[_address] = true;
        return true;
    }

    function deny(address _address) onlyRole("approver") returns(bool) {
        approved[_address] = false;
        return true;
    }
}
