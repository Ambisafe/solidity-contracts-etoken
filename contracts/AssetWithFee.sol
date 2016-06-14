import "EtherTreasuryInterface.sol";
import "Asset.sol";
import "AmbiEnabled.sol";

contract AssetWithFee is Asset, AmbiEnabled {
    uint public refundGas = 40000;
    uint public feeGas = 40000;
    uint public transferCallGas = 21000;
    uint public transferWithReferenceCallGas = 21000;
    uint public transferFromCallGas = 21000;
    uint public transferFromWithReferenceCallGas = 21000;
    uint public transferToICAPCallGas = 21000;
    uint public transferToICAPWithReferenceCallGas = 21000;
    uint public transferFromToICAPCallGas = 21000;
    uint public transferFromToICAPWithReferenceCallGas = 21000;
    uint public approveCallGas = 21000;
    uint public forwardCallGas = 21000;
    uint public setCosignerCallGas = 21000;
    uint public tokenPriceInWeiSell = 1;
    uint public tokenPriceInWeiBuy = 2;
    uint public buyLimitMin = 0;
    uint public buyLimitMax = 0;
    uint public sellLimitMin = 0;
    uint public sellLimitMax = 0;
    address public exchangeAddress;
    EtherTreasuryInterface public treasury;
    address public feeAddress;
    mapping(bytes32 => address) public allowedForwards;

    function setupFee(address _feeAddress) noValue() checkAccess("admin") returns(bool) {
        feeAddress = _feeAddress;
        return true;
    }

    function setupExchange(address _exchangeAddress, uint _buyLimitMin, uint _buyLimitMax, uint _sellLimitMin, uint _sellLimitMax) noValue() checkAccess("admin") returns(bool) {
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

    function setTokenPrice(uint _tokenPriceInWeiSell, uint _tokenPriceInWeiBuy) noValue() checkAccess("cron") returns(bool) {
        if (_tokenPriceInWeiSell == 0 || _tokenPriceInWeiBuy == 0 || _tokenPriceInWeiSell > _tokenPriceInWeiBuy) {
            return false;
        }
        tokenPriceInWeiSell = _tokenPriceInWeiSell;
        tokenPriceInWeiBuy = _tokenPriceInWeiBuy;
        return true;
    }

    function setWholeTokenPrice(uint _wholeTokenPriceInWeiSell, uint _wholeTokenPriceInWeiBuy) noValue() returns(bool) {
        uint wholeToken = (10 ** multiAsset.baseUnit(symbol));
        return setTokenPrice(_wholeTokenPriceInWeiSell / wholeToken, _wholeTokenPriceInWeiBuy / wholeToken);
    }

    function updateFeeGas() noValue() checkAccess("setup") returns(uint) {
        uint startGas = msg.gas;
        if (!_transferFee(msg.sender, 1, "Update fee conf")) {
            return 0;
        }
        feeGas = startGas - msg.gas;
        return feeGas;
    }

    function updateRefundGas() noValue() checkAccess("setup") returns(uint) {
        uint startGas = msg.gas;
        uint refund = (startGas - msg.gas + refundGas) * tx.gasprice; // just to simulate calculations, dunno if optimizer will remove this.
        if (!_refund(1)) {
            return 0;
        }
        refundGas = startGas - msg.gas;
        return refundGas;
    }

    function setOperationsCallGas
        (
            uint _transfer,
            uint _transferFrom,
            uint _transferToICAP,
            uint _transferFromToICAP,
            uint _transferWithReference,
            uint _transferFromWithReference,
            uint _transferToICAPWithReference,
            uint _transferFromToICAPWithReference,
            uint _approve,
            uint _forward,
            uint _setCosigner
        ) noValue() checkAccess("setup") returns(bool)
    {
        transferCallGas = _transfer;
        transferFromCallGas = _transferFrom;
        transferToICAPCallGas = _transferToICAP;
        transferFromToICAPCallGas = _transferFromToICAP;
        transferWithReferenceCallGas = _transferWithReference;
        transferFromWithReferenceCallGas = _transferFromWithReference;
        transferToICAPWithReferenceCallGas = _transferToICAPWithReference;
        transferFromToICAPWithReferenceCallGas = _transferFromToICAPWithReference;
        approveCallGas = _approve;
        forwardCallGas = _forward;
        setCosignerCallGas = _setCosigner;
        return true;
    }

    function setupTreasury(address _treasury) noValue() checkAccess("admin") returns(bool) {
        treasury = EtherTreasuryInterface(_treasury);
        if (msg.value > 0) {
            safeSend(_treasury, msg.value);
        }
        return true;
    }

    function setForward(bytes4 _msgSig, address _forward) noValue() checkAccess("admin") returns(bool) {
        allowedForwards[sha3(_msgSig)] = _forward;
        return true;
    }

    function _stringGas(string _string) constant internal returns(uint) {
        return bytes(_string).length * 75; // ~75 gas per byte, empirical shown 68-72.
    }

    function _transferFee(address _feeFrom, uint _value, string _reference) internal returns(bool) {
        if (feeAddress == 0x0 || feeAddress == _feeFrom) {
            return true;
        }
        if (!multiAsset.transferFromWithReference(_feeFrom, feeAddress, _value, symbol, _reference)) {
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
        return _refund(refund);
    }

    function _refund(uint _value) internal returns(bool) {
        return treasury.withdraw(tx.origin, _value);
    }

    function takeFee(address _feeFrom, uint _value, string _reference) noValue() checkAccess("fee") returns(bool) {
        return _transferFee(_feeFrom, _value, _reference);
    }

    function _transfer(address _to, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + transferCallGas;
        if (!super.transfer(_to, _value)) {
            return (false, false);
        }
        return (true, _applyFeeAndRefund(msg.sender, startGas, "Transfer fee"));
    }

    function _transferFrom(address _from, address _to, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + transferFromCallGas;
        if (!super.transferFrom(_from, _to, _value)) {
            return (false, false);
        }
        return (true, _applyFeeAndRefund(_from, startGas, "Transfer fee"));
    }

    function _transferToICAP(bytes32 _icap, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + transferToICAPCallGas;
        if (!super.transferToICAP(_icap, _value)) {
            return (false, false);
        }
        return (true, _applyFeeAndRefund(msg.sender, startGas, "Transfer fee"));
    }

    function _transferFromToICAP(address _from, bytes32 _icap, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + transferFromToICAPCallGas;
        if (!super.transferFromToICAP(_from, _icap, _value)) {
            return (false, false);
        }
        return (true, _applyFeeAndRefund(_from, startGas, "Transfer fee"));
    }

    function _transferWithReference(address _to, uint _value, string _reference) internal returns(bool, bool) {
        uint startGas = msg.gas + transferWithReferenceCallGas + _stringGas(_reference);
        if (!super.transferWithReference(_to, _value, _reference)) {
            return (false, false);
        }
        return (true, _applyFeeAndRefund(msg.sender, startGas, "Transfer fee"));
    }

    function _transferFromWithReference(address _from, address _to, uint _value, string _reference) internal returns(bool, bool) {
        uint startGas = msg.gas + transferFromWithReferenceCallGas + _stringGas(_reference);
        if (!super.transferFromWithReference(_from, _to, _value, _reference)) {
            return (false, false);
        }
        return (true, _applyFeeAndRefund(_from, startGas, "Transfer fee"));
    }

    function _transferToICAPWithReference(bytes32 _icap, uint _value, string _reference) internal returns(bool, bool) {
        uint startGas = msg.gas + transferToICAPWithReferenceCallGas + _stringGas(_reference);
        if (!super.transferToICAPWithReference(_icap, _value, _reference)) {
            return (false, false);
        }
        return (true, _applyFeeAndRefund(msg.sender, startGas, "Transfer fee"));
    }

    function _transferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) internal returns(bool, bool) {
        uint startGas = msg.gas + transferFromToICAPWithReferenceCallGas + _stringGas(_reference);
        if (!super.transferFromToICAPWithReference(_from, _icap, _value, _reference)) {
            return (false, false);
        }
        return (true, _applyFeeAndRefund(_from, startGas, "Transfer fee"));
    }

    function _approve(address _spender, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + approveCallGas;
        if (!super.approve(_spender, _value)) {
            return (false, false);
        }
        return (true, _applyFeeAndRefund(msg.sender, startGas, "Approve fee"));
    }

    function _setCosignerAddress(address _cosigner) internal returns(bool, bool) {
        uint startGas = msg.gas + setCosignerCallGas;
        if (!super.setCosignerAddress(_cosigner)) {
            return (false, false);
        }
        return (true, _applyFeeAndRefund(msg.sender, startGas, "Cosigner fee"));
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

    function transferToICAP(bytes32 _icap, uint _value) returns(bool) {
        bool success;
        (success,) = _transferToICAP(_icap, _value);
        return success;
    }

    function transferFromToICAP(address _from, bytes32 _icap, uint _value) returns(bool) {
        bool success;
        (success,) = _transferFromToICAP(_from, _icap, _value);
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

    function transferToICAPWithReference(bytes32 _icap, uint _value, string _reference) returns(bool) {
        bool success;
        (success,) = _transferToICAPWithReference(_icap, _value, _reference);
        return success;
    }

    function transferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) returns(bool) {
        bool success;
        (success,) = _transferFromToICAPWithReference(_from, _icap, _value, _reference);
        return success;
    }

    function approve(address _spender, uint _value) returns(bool) {
        bool success;
        (success,) = _approve(_spender, _value);
        return success;
    }

    function setCosignerAddress(address _cosigner) returns(bool) {
        bool success;
        (success,) = _setCosignerAddress(_cosigner);
        return success;
    }

    function checkTransfer(address _to, uint _value) constant returns(bool, bool) {
        return _transfer(_to, _value);
    }

    function checkTransferFrom(address _from, address _to, uint _value) constant returns(bool, bool) {
        return _transferFrom(_from, _to, _value);
    }

    function checkTransferToICAP(bytes32 _icap, uint _value) constant returns(bool, bool) {
        return _transferToICAP(_icap, _value);
    }

    function checkTransferFromToICAP(address _from, bytes32 _icap, uint _value) constant returns(bool, bool) {
        return _transferFromToICAP(_from, _icap, _value);
    }

    function checkTransferWithReference(address _to, uint _value, string _reference) constant returns(bool, bool) {
        return _transferWithReference(_to, _value, _reference);
    }

    function checkTransferFromWithReference(address _from, address _to, uint _value, string _reference) constant returns(bool, bool) {
        return _transferFromWithReference(_from, _to, _value, _reference);
    }

    function checkTransferToICAPWithReference(bytes32 _icap, uint _value, string _reference) constant returns(bool, bool) {
        return _transferToICAPWithReference(_icap, _value, _reference);
    }

    function checkTransferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) constant returns(bool, bool) {
        return _transferFromToICAPWithReference(_from, _icap, _value, _reference);
    }

    function checkApprove(address _spender, uint _value) constant returns(bool, bool) {
        return _approve(_spender, _value);
    }

    function checkSetCosignerAddress(address _cosigner) constant returns(bool, bool) {
        return _setCosignerAddress(_cosigner);
    }

    function checkForward(bytes _data) constant returns(bool, bool) {
        bytes memory sig = new bytes(4);
        sig[0] = _data[0];
        sig[1] = _data[1];
        sig[2] = _data[2];
        sig[3] = _data[3];
        return _forward(allowedForwards[sha3(sig)], _data);
    }

    function _forward(address _to, bytes _data) internal returns(bool, bool) {
        uint startGas = msg.gas + forwardCallGas + (_data.length * 50); // 50 gas per byte;
        if (_to == 0x0) {
            return (false, safeFalse());
        }
        if (!_to.call.value(msg.value)(_data)) {
            return (false, safeFalse());
        }
        return (true, _applyFeeAndRefund(msg.sender, startGas, "Forward fee"));
    }

    function () returns(bool) {
        bool success;
        (success,) = _forward(allowedForwards[sha3(msg.sig)], msg.data);
        return success;
    }

    function sell(address _to, uint _value) noValue() returns(bool) {
        if (exchangeAddress == 0x0 || _value < sellLimitMin || _value > sellLimitMax) {
            return false;
        }
        if (!multiAsset.transferFromWithReference(msg.sender, exchangeAddress, _value, symbol, "Sell")) {
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
        if (exchangeAddress == 0x0 || value < buyLimitMin || value > buyLimitMax) {
            return false;
        }
        if (!multiAsset.transferFromWithReference(exchangeAddress, _to, value, symbol, "Buy")) {
            return false;
        }
        safeSend(exchangeAddress, msg.value);
        return true;
    }
}

// RegEx to remove all admin functions from ABI: (?s)\{\s+"constant"[^[]+\[[^\]]*\][^:]+:\s*"(transferFromToICAPCallGas|transferFromToICAPWithReferenceCallGas|transferToICAPCallGas|transferToICAPWithReferenceCallGas|refundGas|feeGas|transferCallGas|transferWithReferenceCallGas|transferFromCallGas|transferFromWithReferenceCallGas|approveCallGas|forwardCallGas|setupFee|setupExchange|setTokenPrice|setWholeTokenPrice|updateFeeGas|updateRefundGas|setOperationsCallGas|setupTreasury|treasury|setForward|takeFee|init|emitTransfer|emitApprove|ambiC|name|getAddress|setAmbiAddress|remove)"[^\]]+[^}]+},\s+
// RegEx to remove all admin and exchange functions from ABI: (?s)\{\s+"constant"[^[]+\[[^\]]*\][^:]+:\s*"(transferFromToICAPCallGas|transferFromToICAPWithReferenceCallGas|transferToICAPCallGas|transferToICAPWithReferenceCallGas|tokenPriceInWeiBuy|buyLimitMin|buyLimitMax|sellLimitMin|sellLimitMax|exchangeAddress|buy|sell|refundGas|feeGas|transferCallGas|transferWithReferenceCallGas|transferFromCallGas|transferFromWithReferenceCallGas|approveCallGas|forwardCallGas|setupFee|setupExchange|setTokenPrice|setWholeTokenPrice|updateFeeGas|updateRefundGas|setOperationsCallGas|setupTreasury|treasury|setForward|takeFee|init|emitTransfer|emitApprove|ambiC|name|getAddress|setAmbiAddress|remove)"[^\]]+[^}]+},\s+