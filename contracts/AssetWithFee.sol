import "MultiAsset.sol";

contract Treasury {
    function isActiveClient(uint _client) constant returns (bool);
    function withdraw(address _to, uint _client, uint _amount, uint _product) returns(bool);
}

contract AssetWithFee {
    uint public refundGas = 40000;
    uint public feeGas = 40000;
    uint public transferCallGas = 21000;
    uint public transferWithReferenceCallGas = 21000;
    uint public transferFromCallGas = 21000;
    uint public transferFromWithReferenceCallGas = 21000;
    uint public approveCallGas = 21000;
    uint public confirmCallGas = 21000;
    uint public clientId;
    uint public tokenPriceInWei = 1;
    uint public gasPriceLimit = 0;
    Treasury treasury;
    address public feeAddress;

    modifier onlyOwner() {
        if (multiAsset.isOwner(msg.sender, symbol)) {
            _
        }
    }

    function setupFee(address _feeAddress) onlyOwner() returns(bool) {
        feeAddress = _feeAddress;
        return true;
    }

    function setFeeGasPriceLimit(uint _gasPriceLimit) onlyOwner() returns(bool) {
        gasPriceLimit = _gasPriceLimit;
        return true;
    }

    function setTokenPrice(uint _tokenPriceInWei) onlyOwner() returns(bool) {
        if (_tokenPriceInWei == 0) {
            return false;
        }
        tokenPriceInWei = _tokenPriceInWei;
        return true;
    }

    function setWholeTokenPrice(uint _wholeTokenPriceInWei) onlyOwner() returns(bool) {
        uint wholeToken = (10 ** multiAsset.baseUnit(symbol));
        uint price = _wholeTokenPriceInWei / wholeToken;
        if (price == 0) {
            return false;
        }
        tokenPriceInWei = price;
        return true;
    }

    function updateFeeGas(uint _surplus) onlyOwner() returns(uint) {
        uint startGas = msg.gas;
        if (!_transferFee(msg.sender, 1, "Update fee conf")) {
            return 0;
        }
        feeGas = startGas - msg.gas + _surplus;
        return feeGas;
    }

    function updateRefundGas(uint _surplus) onlyOwner() returns(uint) {
        uint startGas = msg.gas;
        uint refund = (startGas - msg.gas + refundGas) * tx.gasprice; // just to simulate calculations, dunno if optimizer will remove this.
        if (!_refund(1)) {
            return 0;
        }
        refundGas = startGas - msg.gas + _surplus;
        return refundGas;
    }

    function setOperationsCallGas(uint _transfer, uint _transferFrom, uint _transferWithReference, uint _transferFromWithReference, uint _approve, uint _confirm) onlyOwner() returns(bool) {
        transferCallGas = _transfer;
        transferFromCallGas = _transferFrom;
        transferWithReferenceCallGas = _transferWithReference;
        transferFromWithReferenceCallGas = _transferFromWithReference;
        approveCallGas = _approve;
        confirmCallGas = _confirm;
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

    // DEPLOY REMOVE START

    function getTransferCallGas(address _to, uint _value) returns(uint) {
        return _value;
    }

    function getTransferFromCallGas(address _from, address _to, uint _value) returns(uint) {
        return _value;
    }

    function getTransferWithReferenceCallGas(address _to, uint _value, string _reference) returns(uint) {
        return _value;
    }

    function getTransferFromWithReferenceCallGas(address _from, address _to, uint _value, string _reference) returns(uint) {
        return _value;
    }

    function getApproveCallGas(address _spender, uint _value) returns(uint) {
        return _value;
    }

    function getConfirmCallGas(address _cosigner, bytes32 _opHash, address _account, uint _nonce, uint8 _v, bytes32 _r, bytes32 _s) returns(uint) {
        return _nonce;
    }

    // DEPLOY REMOVE END

    function _stringGas(string _string) constant internal returns(uint) {
        return bytes(_string).length * 75; // ~75 gas per byte, empirical shown 68-72.
    }

    function _transferFee(address _feeFrom, uint _value, string _reference) internal returns(bool) {
        if (feeAddress == 0x0 || feeAddress == msg.sender) {
            return true;
        }
        if (!multiAsset.proxyTransferDirect(_feeFrom, feeAddress, _value, symbol, _reference)) {
            return false;
        }
        return true;
    }

    function _applyFeeAndRefund(address _feeFrom, uint _startGas, string _referece) internal returns(uint) {
        uint fee = ((_startGas - msg.gas + refundGas + feeGas) * tx.gasprice / tokenPriceInWei) + 1; // Round up.
        if ((gasPriceLimit != 0 && tx.gasprice > gasPriceLimit) || !_transferFee(_feeFrom, fee, _referece)) {
            return 0;
        }
        uint refund = (_startGas - msg.gas + refundGas) * tx.gasprice;
        _refund(refund);
        return fee;
    }

    function _refund(uint _value) internal returns(bool) {
        return treasury.withdraw(tx.origin, clientId, _value, uint(msg.sig));
    }

    function _transfer(address _to, uint _value) internal returns(bool, uint) {
        uint startGas = msg.gas + transferCallGas;
        if (!multiAsset.proxyTransfer(_to, _value, symbol, msg.sender)) {
            return (false, 0);
        }
        return (true, _applyFeeAndRefund(msg.sender, startGas, "Transfer fee"));
    }

    function _transferFrom(address _from, address _to, uint _value) internal returns(bool, uint) {
        uint startGas = msg.gas + transferFromCallGas;
        if (!multiAsset.proxyTransferFrom(_from, _to, _value, symbol, msg.sender)) {
            return (false, 0);
        }
        return (true, _applyFeeAndRefund(_from, startGas, "Transfer fee"));
    }

    function _transferWithReference(address _to, uint _value, string _reference) internal returns(bool, uint) {
        uint startGas = msg.gas + transferWithReferenceCallGas + _stringGas(_reference);
        if (!multiAsset.proxyTransferWithReference(_to, _value, symbol, _reference, msg.sender)) {
            return (false, 0);
        }
        return (true, _applyFeeAndRefund(msg.sender, startGas, "Transfer fee"));
    }

    function _transferFromWithReference(address _from, address _to, uint _value, string _reference) internal returns(bool, uint) {
        uint startGas = msg.gas + transferFromWithReferenceCallGas + _stringGas(_reference);
        if (!multiAsset.proxyTransferFromWithReference(_from, _to, _value, symbol, _reference, msg.sender)) {
            return (false, 0);
        }
        return (true, _applyFeeAndRefund(_from, startGas, "Transfer fee"));
    }

    function _approve(address _spender, uint _value) internal returns(bool, uint) {
        uint startGas = msg.gas + approveCallGas;
        if (!multiAsset.proxyApprove(_spender, _value, symbol, msg.sender)) {
            return (false, 0);
        }
        return (true, _applyFeeAndRefund(msg.sender, startGas, "Approve fee"));
    }

    function transfer(address _to, uint _value) returns(bool) {
        bool success;
        (success,) = _transfer(_to, _value);
        return success;
    }

    function transferFrom(address _from, address _to, uint _value) returns(bool) {
        bool success;
        (success,) = _transferFrom(_from, _to, _value);
        return success;
    }

    function transferWithReference(address _to, uint _value, string _reference) returns(bool) {
        bool success;
        (success,) = _transferWithReference(_to, _value, _reference);
        return success;
    }

    function transferFromWithReference(address _from, address _to, uint _value, string _reference) returns(bool) {
        bool success;
        (success,) = _transferFromWithReference(_from, _to, _value, _reference);
        return success;
    }

    function approve(address _spender, uint _value) returns(bool) {
        bool success;
        (success,) = _approve(_spender, _value);
        return success;
    }

    function checkTransfer(address _to, uint _value) constant returns(bool, uint) {
        return _transfer(_to, _value);
    }

    function checkTransferFrom(address _from, address _to, uint _value) constant returns(bool, uint) {
        return _transferFrom(_from, _to, _value);
    }

    function checkTransferWithReference(address _to, uint _value, string _reference) constant returns(bool, uint) {
        return _transferWithReference(_to, _value, _reference);
    }

    function checkTransferFromWithReference(address _from, address _to, uint _value, string _reference) constant returns(bool, uint) {
        return _transferFromWithReference(_from, _to, _value, _reference);
    }

    function checkApprove(address _spender, uint _value) constant returns(bool, uint) {
        return _approve(_spender, _value);
    }

    function _confirm(address _cosigner, bytes32 _opHash, address _account, uint _nonce, uint8 _v, bytes32 _r, bytes32 _s) internal returns(bool, uint) {
        uint startGas = msg.gas + confirmCallGas;
        if (!Cosigner(_cosigner).confirm(_opHash, _account, _nonce, _v, _r, _s)) {
            return (false, 0);
        }
        return (true, _applyFeeAndRefund(msg.sender, startGas, "Confirm fee"));
    }

    function confirm(address _cosigner, bytes32 _opHash, address _account, uint _nonce, uint8 _v, bytes32 _r, bytes32 _s) returns(bool) {
        bool success;
        (success,) = _confirm(_cosigner, _opHash, _account, _nonce, _v, _r, _s);
        return success;
    }

    function checkConfirm(address _cosigner, bytes32 _opHash, address _account, uint _nonce, uint8 _v, bytes32 _r, bytes32 _s) constant returns(bool, uint) {
        return _confirm(_cosigner, _opHash, _account, _nonce, _v, _r, _s);
    }






    event Transfer(address indexed from, address indexed to, uint value);
    event Approve(address indexed from, address indexed spender, uint value);

    MultiAsset multiAsset;
    bytes32 symbol;

    function init(address _multiAsset, bytes32 _symbol) returns(bool) {
        if (address(multiAsset) != 0x0) {
            return false;
        }
        multiAsset = MultiAsset(_multiAsset);
        symbol = _symbol;
        return true;
    }

    modifier onlyMultiAsset() {
        if (msg.sender == address(multiAsset)) {
            _
        }
    }

    function totalSupply() constant returns(uint) {
        return multiAsset.totalSupply(symbol);
    }

    function balanceOf(address _owner) constant returns(uint) {
        return multiAsset.balanceOf(_owner, symbol);
    }

    function allowance(address _from, address _spender) constant returns(uint) {
        return multiAsset.allowance(_from, _spender, symbol);
    }

    function emitTransfer(address _from, address _to, uint _value) onlyMultiAsset() {
        Transfer(_from, _to, _value);
    }

    function emitApprove(address _from, address _spender, uint _value) onlyMultiAsset() {
        Approve(_from, _spender, _value);
    }
}