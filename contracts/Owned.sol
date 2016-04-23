contract Owned {
    address public contractOwner;

    function Owned() {
        contractOwner = msg.sender;
    }

    modifier onlyContractOwner() {
        if (contractOwner == msg.sender) {
            _
        }
    }

    function changeContractOwnership(address _to) onlyContractOwner() returns(bool) {
        contractOwner = _to;
        return true;
    }
}