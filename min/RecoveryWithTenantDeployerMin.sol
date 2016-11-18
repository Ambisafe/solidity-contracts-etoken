pragma solidity ^0.4.4;

import "RecoveryWithTenant.sol";

contract RecoveryWithTenantDeployer {
    event Deploy(address contractAddress);

    address[] contracts;

    function getContracts() constant returns(address[]) {
        return contracts;
    }

    function deploy(address _oracle, address _tenant, address _callDestination) returns(bool) {
        var recoveryWithTenant = new RecoveryWithTenant();
        contracts.push(address(recoveryWithTenant));
        Deploy(address(recoveryWithTenant));
        return recoveryWithTenant.configure(_tenant, _callDestination, 0, 0, 0, 0) 
            && recoveryWithTenant.setOracle(_oracle);
    }
}
