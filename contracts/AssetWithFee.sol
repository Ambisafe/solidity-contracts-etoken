import "MultiAsset.sol";
import "EtherTreasuryLight.sol";

contract AssetWithFee {
    uint public refundGas = 40000;
    uint public feeGas = 40000;
    uint public transferCallGas = 21000;
    uint public transferWithReferenceCallGas = 21000;
    uint public transferFromCallGas = 21000;
    uint public transferFromWithReferenceCallGas = 21000;
    uint public approveCallGas = 21000;
    uint public tokenPriceInWeiSell = 1;
    uint public tokenPriceInWeiBuy = 2;
    uint public buyLimitMin = 0;
    uint public buyLimitMax = 0;
    uint public sellLimitMin = 0;
    uint public sellLimitMax = 0;
    EtherTreasuryLight treasury;
    address public feeAddress;
    address public exchangeAddress;

    modifier onlyOwner() {
        if (multiAsset.isOwner(msg.sender, symbol)) {
            _
        }
    }

    function setupFee(address _feeAddress) onlyOwner() returns(bool) {
        feeAddress = _feeAddress;
        return true;
    }

    function setupExchange(address _exchangeAddress, uint _buyLimitMin, uint _buyLimitMax, uint _sellLimitMin, uint _sellLimitMax) onlyOwner() returns(bool) {
        if (_buyLimitMin > _buyLimitMax || _sellLimitMin > _sellLimitMax) {
            return false;
        }
        exchangeAddress = _exchangeAddress;
        buyLimitMin = _buyLimitMin;
        buyLimitMax = _buyLimitMax;
        sellLimitMin = _sellLimitMin;
        sellLimitMax = _sellLimitMax;
        return true;
    }

    function setTokenPrice(uint _tokenPriceInWeiSell, uint _tokenPriceInWeiBuy) onlyOwner() returns(bool) {
        if (_tokenPriceInWeiSell == 0 || _tokenPriceInWeiBuy == 0 || _tokenPriceInWeiSell > _tokenPriceInWeiBuy) {
            return false;
        }
        tokenPriceInWeiSell = _tokenPriceInWeiSell;
        tokenPriceInWeiBuy = _tokenPriceInWeiBuy;
        return true;
    }

    function setWholeTokenPrice(uint _wholeTokenPriceInWeiSell, uint _wholeTokenPriceInWeiBuy) onlyOwner() returns(bool) {
        uint wholeToken = (10 ** multiAsset.baseUnit(symbol));
        return setTokenPrice(_wholeTokenPriceInWeiSell / wholeToken, _wholeTokenPriceInWeiBuy / wholeToken);
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
        if (!_refund(1, "Update")) {
            return 0;
        }
        refundGas = startGas - msg.gas + _surplus;
        return refundGas;
    }

    function setOperationsCallGas(uint _transfer, uint _transferFrom, uint _transferWithReference, uint _transferFromWithReference, uint _approve) onlyOwner() returns(bool) {
        transferCallGas = _transfer;
        transferFromCallGas = _transferFrom;
        transferWithReferenceCallGas = _transferWithReference;
        transferFromWithReferenceCallGas = _transferFromWithReference;
        approveCallGas = _approve;
        return true;
    }

    function setupTreasury(address _treasury) onlyOwner() returns(bool) {
        treasury = EtherTreasuryLight(_treasury);
        if (msg.value > 0 && !treasury.deposit.value(msg.value)(address(this))) {
            throw;
        }
        return true;
    }

    // DEPLOY REMOVE START

    function getTransferCallGas(address _to, uint _value) returns(bool) {
        return true;
    }

    function getTransferFromCallGas(address _from, address _to, uint _value) returns(bool) {
        return true;
    }

    function getTransferWithReferenceCallGas(address _to, uint _value, string _reference) returns(bool) {
        return true;
    }

    function getTransferFromWithReferenceCallGas(address _from, address _to, uint _value, string _reference) returns(bool) {
        return true;
    }

    function getApproveCallGas(address _spender, uint _value) returns(bool) {
        return true;
    }

    function getForwardCallGas(address _to, bytes _data) returns(bool) {
        return true;
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

    function _applyFeeAndRefund(address _feeFrom, uint _startGas, string _reference) internal returns(bool) {
        uint fee = ((_startGas - msg.gas + refundGas + feeGas) * tx.gasprice / tokenPriceInWeiSell) + 1; // Round up.
        if (!_transferFee(_feeFrom, fee, _reference)) {
            return false;
        }
        uint refund = (_startGas - msg.gas + refundGas) * tx.gasprice;
        return _refund(refund, _reference);
    }

    function _refund(uint _value, string _reference) internal returns(bool) {
        return treasury.withdrawWithReference(tx.origin, _value, _reference);
    }

    function _transfer(address _to, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + transferCallGas;
        if (!multiAsset.proxyTransfer(_to, _value, symbol, msg.sender)) {
            return (false, false);
        }
        return (true, _applyFeeAndRefund(msg.sender, startGas, "Transfer fee"));
    }

    function _transferFrom(address _from, address _to, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + transferFromCallGas;
        if (!multiAsset.proxyTransferFrom(_from, _to, _value, symbol, msg.sender)) {
            return (false, false);
        }
        return (true, _applyFeeAndRefund(_from, startGas, "Transfer fee"));
    }

    function _transferWithReference(address _to, uint _value, string _reference) internal returns(bool, bool) {
        uint startGas = msg.gas + transferWithReferenceCallGas + _stringGas(_reference);
        if (!multiAsset.proxyTransferWithReference(_to, _value, symbol, _reference, msg.sender)) {
            return (false, false);
        }
        return (true, _applyFeeAndRefund(msg.sender, startGas, "Transfer fee"));
    }

    function _transferFromWithReference(address _from, address _to, uint _value, string _reference) internal returns(bool, bool) {
        uint startGas = msg.gas + transferFromWithReferenceCallGas + _stringGas(_reference);
        if (!multiAsset.proxyTransferFromWithReference(_from, _to, _value, symbol, _reference, msg.sender)) {
            return (false, false);
        }
        return (true, _applyFeeAndRefund(_from, startGas, "Transfer fee"));
    }

    function _approve(address _spender, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + approveCallGas;
        if (!multiAsset.proxyApprove(_spender, _value, symbol, msg.sender)) {
            return (false, false);
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

    function checkTransfer(address _to, uint _value) constant returns(bool, bool) {
        return _transfer(_to, _value);
    }

    function checkTransferFrom(address _from, address _to, uint _value) constant returns(bool, bool) {
        return _transferFrom(_from, _to, _value);
    }

    function checkTransferWithReference(address _to, uint _value, string _reference) constant returns(bool, bool) {
        return _transferWithReference(_to, _value, _reference);
    }

    function checkTransferFromWithReference(address _from, address _to, uint _value, string _reference) constant returns(bool, bool) {
        return _transferFromWithReference(_from, _to, _value, _reference);
    }

    function checkApprove(address _spender, uint _value) constant returns(bool, bool) {
        return _approve(_spender, _value);
    }

    function forward(address _to, bytes _data) onlyOwner() returns(bool) {
        return _to.call(_data);
    }

    function sell(address _to, uint _value) returns(bool) {
        if (exchangeAddress == 0x0 || _value < sellLimitMin  || _value > sellLimitMax) {
            return false;
        }
        if (!multiAsset.proxyTransferFromWithReference(msg.sender, exchangeAddress, _value, symbol, "Sell", address(this))) {
            return false;
        }
        uint result = _value * tokenPriceInWeiSell;
        if (!treasury.withdrawWithReference(_to, result, "Sell")) {
            throw;
        }
        return true;
    }

    function buy(address _to) returns(bool) {
        uint value = msg.value / tokenPriceInWeiBuy;
        if (exchangeAddress == 0x0 || value < buyLimitMin  || value > buyLimitMax) {
            return false;
        }
        if (!treasury.deposit.value(msg.value)(address(this))) {
            return false;
        }
        if (!multiAsset.proxyTransferWithReference(_to, value, symbol, "Buy", exchangeAddress)) {
            throw;
        }
        return true;
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