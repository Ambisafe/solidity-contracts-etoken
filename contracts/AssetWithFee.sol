import "Asset.sol";

contract Treasury{
    function isActiveClient(uint _client) constant returns (bool);
    function withdraw(address _to, uint _client, uint _amount, uint _product);
}

contract AssetWithFee is Asset {
    address feeAddress;
    uint transferFee;
    uint overhead = 20000;
    Treasury treasury;
    uint clientId;

    event Fee(address from, uint value);

    modifier onlyOwner() {
        if (multiAsset.isOwner(msg.sender, symbol)) {
            _
        }
    }

    function setupFee(address _feeAddress, uint _transferFee) onlyOwner() returns(bool) {
        feeAddress = _feeAddress;
        transferFee = _transferFee;
        return true;
    }

    function setupTreasury(address _treasury, uint _client) onlyOwner() returns(bool) {
        treasury = Treasury(_treasury);
        if (!treasury.isActiveClient(_client)) {
            return false;
        }
        clientId = _client;
        return true;
    }

    function _transferFee(uint _value, string _reference) internal returns(bool) {
        if (feeAddress == 0x0) {
            return true;
        }
        if (!multiAsset.proxyTransferDirect(msg.sender, feeAddress, _value, symbol, _reference)) {
            return false;
        }
        Fee(msg.sender, _value);
        return true;
    }

    function transfer(address _to, uint _value) returns(bool) {
        uint startGas = msg.gas;
        bool success = true;
        if (balanceOf(msg.sender) < _value + transferFee) {
            success = false;
        }
        if (!success || !super.transfer(_to, _value) || !_transferFee(transferFee, "Fee")) {
            return false;
        }
        uint cost = (startGas - msg.gas + overhead) * tx.gasprice;
        treasury.withdraw(msg.sender, clientId, cost, uint(msg.sig));
        return true;
    }

    function transferWithReference(address _to, uint _value, string _reference) returns(bool) {
        if (!super.transferWithReference(_to, _value, _reference)) {
            return false;
        }
        return true;
    }
    
    function transferFrom(address _from, address _to, uint _value) returns(bool) {
        if (!super.transferFrom(_from, _to, _value)) {
            return false;
        }
        return true;
    }

    function transferFromWithReference(address _from, address _to, uint _value, string _reference) returns(bool) {
        if (!super.transferFromWithReference(_from, _to, _value, _reference)) {
            return false;
        }
        return true;
    }

    function approve(address _spender, uint _value) returns(bool) {
        if (!super.approve(_spender, _value)) {
            return false;
        }
        return true;
    }
}