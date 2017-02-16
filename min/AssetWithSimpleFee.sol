pragma solidity ^0.4.9;

import "EtherTreasuryInterface.sol";
import "Ambi2EnabledFull.sol";
import "Asset.sol";

contract AssetWithSimpleFee is Asset, Ambi2EnabledFull {
    uint public txGasPriceLimit;
    uint public refundGas;
    uint public transferCallGas;
    uint public transferWithReferenceCallGas;
    uint public transferFromCallGas;
    uint public transferFromWithReferenceCallGas;
    uint public transferToICAPCallGas;
    uint public transferToICAPWithReferenceCallGas;
    uint public transferFromToICAPCallGas;
    uint public transferFromToICAPWithReferenceCallGas;
    uint public approveCallGas;
    uint public forwardCallGas;
    uint public setCosignerCallGas;
    uint public absMinFee;
    uint public feePercent; // set up in 1/100 of percent, 10 is 0.1%
    uint public absMaxFee;
    EtherTreasuryInterface public treasury;
    address public feeAddress;
    bool private __isAllowed;
    mapping(bytes32 => address) public allowedForwards;

    function setFeeStructure(uint _absMinFee, uint _feePercent, uint _absMaxFee) onlyRole("cron") returns (bool) {
        if(_feePercent > 10000 || _absMaxFee < _absMinFee) {
            return false;
        }
        absMinFee = _absMinFee;
        feePercent = _feePercent;
        absMaxFee = _absMaxFee;
        return true;
    }

    function setupFee(address _feeAddress) onlyRole("admin") returns(bool) {
        feeAddress = _feeAddress;
        return true;
    }

    function updateRefundGas() onlyRole("setup") returns(uint) {
        uint startGas = msg.gas;
        // just to simulate calculations
        uint refund = (startGas - msg.gas + refundGas) * tx.gasprice;
        if (tx.gasprice > txGasPriceLimit) {
            return 0;
        }
        // end
        if (!_refund(5000000000000000)) {
            return 0;
        }
        refundGas = startGas - msg.gas;
        return refundGas;
    }

    function setOperationsCallGas(
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
    )
        onlyRole("setup")
        returns(bool)
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

    function setupTreasury(EtherTreasuryInterface _treasury, uint _txGasPriceLimit) payable onlyRole("admin") returns(bool) {
        if (_txGasPriceLimit == 0) {
            return _safeFalse();
        }
        treasury = _treasury;
        txGasPriceLimit = _txGasPriceLimit;
        if (msg.value > 0) {
            _safeSend(_treasury, msg.value);
        }
        return true;
    }

    function setForward(bytes4 _msgSig, address _forward) onlyRole("admin") returns(bool) {
        allowedForwards[sha3(_msgSig)] = _forward;
        return true;
    }

    function _stringGas(string _string) constant internal returns(uint) {
        return bytes(_string).length * 75; // ~75 gas per byte, empirical shown 68-72.
    }

    function _transferFee(address _feeFrom, uint _value, string _reference) internal returns(bool) {
        if (feeAddress == 0x0 || feeAddress == _feeFrom || _value == 0) {
            return true;
        }
        return multiAsset.transferFromWithReference(_feeFrom, feeAddress, _value, symbol, _reference);
    }

    function _returnFee(address _to, uint _value) internal returns(bool, bool) {
        if (feeAddress == 0x0 || feeAddress == _to || _value == 0) {
            return (false, true);
        }
        if (!multiAsset.transferFromWithReference(feeAddress, _to, _value, symbol, "Fee return")) {
            throw;
        }
        return (false, true);
    }

    function _applyRefund(uint _startGas) internal returns(bool) {
        uint refund = (_startGas - msg.gas + refundGas) * tx.gasprice;
        return _refund(refund);
    }

    function _refund(uint _value) internal returns(bool) {
        if (tx.gasprice > txGasPriceLimit) {
            return false;
        }
        return treasury.withdraw(tx.origin, _value);
    }

    function _allow() internal {
        __isAllowed = true;
    }

    function _disallow() internal {
        __isAllowed = false;
    }

    function calculateFee(uint _value) constant returns(uint) {
        uint fee = (_value * feePercent) / 10000;
        if (fee < absMinFee) {
            return absMinFee;
        }
        if (fee > absMaxFee) {
            return absMaxFee;
        }
        return fee;
    }

    function calculateFeeDynamic(uint _value, uint _additionalGas) constant returns(uint) {
        uint fee = calculateFee(_value);
        if (_additionalGas <= 7500) {
            return fee;
        }
        // Assuming that absMinFee covers at least 100000 gas refund, let's add another absMinFee
        // for every other 100000 additional gas.
        uint additionalFee = ((_additionalGas / 100000) + 1) * absMinFee;
        return fee + additionalFee;
    }

    function takeFee(address _feeFrom, uint _value, string _reference) onlyRole("fee") returns(bool) {
        return _transferFee(_feeFrom, _value, _reference);
    }

    function _transfer(address _to, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + transferCallGas;
        uint fee = calculateFee(_value);
        if (!_transferFee(msg.sender, fee, "Transfer fee")) {
            return (false, false);
        }
        _allow();
        bool success = super.transfer(_to, _value);
        _disallow();
        if (!success) {
            return _returnFee(msg.sender, fee);
        }
        return (true, _applyRefund(startGas));
    }

    function _transferFrom(address _from, address _to, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + transferFromCallGas;
        uint fee = calculateFee(_value);
        if (!_transferFee(_from, fee, "Transfer fee")) {
            return (false, false);
        }
        _allow();
        bool success = super.transferFrom(_from, _to, _value);
        _disallow();
        if (!success) {
            return _returnFee(_from, fee);
        }
        return (true, _applyRefund(startGas));
    }

    function _transferToICAP(bytes32 _icap, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + transferToICAPCallGas;
        uint fee = calculateFee(_value);
        if (!_transferFee(msg.sender, fee, "Transfer fee")) {
            return (false, false);
        }
        _allow();
        bool success = super.transferToICAP(_icap, _value);
        _disallow();
        if (!success) {
            return _returnFee(msg.sender, fee);
        }
        return (true, _applyRefund(startGas));
    }

    function _transferFromToICAP(address _from, bytes32 _icap, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + transferFromToICAPCallGas;
        uint fee = calculateFee(_value);
        if (!_transferFee(_from, fee, "Transfer fee")) {
            return (false, false);
        }
        _allow();
        bool success = super.transferFromToICAP(_from, _icap, _value);
        _disallow();
        if (!success) {
            return _returnFee(_from, fee);
        }
        return (true, _applyRefund(startGas));
    }

    function _transferWithReference(address _to, uint _value, string _reference) internal returns(bool, bool) {
        uint startGas = msg.gas + transferWithReferenceCallGas;
        uint additionalGas = _stringGas(_reference);
        uint fee = calculateFeeDynamic(_value, additionalGas);
        if (!_transferFee(msg.sender, fee, "Transfer fee")) {
            return (false, false);
        }
        _allow();
        bool success = super.transferWithReference(_to, _value, _reference);
        _disallow();
        if (!success) {
            return _returnFee(msg.sender, fee);
        }
        return (true, _applyRefund(startGas + additionalGas));
    }

    function _transferFromWithReference(address _from, address _to, uint _value, string _reference) internal returns(bool, bool) {
        uint startGas = msg.gas + transferFromWithReferenceCallGas;
        uint additionalGas = _stringGas(_reference);
        uint fee = calculateFeeDynamic(_value, additionalGas);
        if (!_transferFee(_from, fee, "Transfer fee")) {
            return (false, false);
        }
        _allow();
        bool success = super.transferFromWithReference(_from, _to, _value, _reference);
        _disallow();
        if (!success) {
            return _returnFee(_from, fee);
        }
        return (true, _applyRefund(startGas + additionalGas));
    }

    function _transferToICAPWithReference(bytes32 _icap, uint _value, string _reference) internal returns(bool, bool) {
        uint startGas = msg.gas + transferToICAPWithReferenceCallGas;
        uint additionalGas = _stringGas(_reference);
        uint fee = calculateFeeDynamic(_value, additionalGas);
        if (!_transferFee(msg.sender, fee, "Transfer fee")) {
            return (false, false);
        }
        _allow();
        bool success = super.transferToICAPWithReference(_icap, _value, _reference);
        _disallow();
        if (!success) {
            return _returnFee(msg.sender, fee);
        }
        return (true, _applyRefund(startGas + additionalGas));
    }

    function _transferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) internal returns(bool, bool) {
        uint startGas = msg.gas + transferFromToICAPWithReferenceCallGas;
        uint additionalGas = _stringGas(_reference);
        uint fee = calculateFeeDynamic(_value, additionalGas);
        if (!_transferFee(_from, fee, "Transfer fee")) {
            return (false, false);
        }
        _allow();
        bool success = super.transferFromToICAPWithReference(_from, _icap, _value, _reference);
        _disallow();
        if (!success) {
            return _returnFee(_from, fee);
        }
        return (true, _applyRefund(startGas + additionalGas));
    }

    function _approve(address _spender, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + approveCallGas;
        // Don't take fee when enabling fee taking.
        // Don't refund either.
        if (_spender == address(this)) {
            return (super.approve(_spender, _value), false);
        }
        uint fee = calculateFee(0);
        if (!_transferFee(msg.sender, fee, "Approve fee")) {
            return (false, false);
        }
        _allow();
        bool success = super.approve(_spender, _value);
        _disallow();
        if (!success) {
            return _returnFee(msg.sender, fee);
        }
        return (true, _applyRefund(startGas));
    }

    function _setCosignerAddress(address _cosigner) internal returns(bool, bool) {
        uint startGas = msg.gas + setCosignerCallGas;
        uint fee = calculateFee(0);
        if (!_transferFee(msg.sender, fee, "Cosigner fee")) {
            return (false, false);
        }
        if (!super.setCosignerAddress(_cosigner)) {
            return _returnFee(msg.sender, fee);
        }
        return (true, _applyRefund(startGas));
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

    function _forward(address _to, bytes _data) internal returns(bool, bool) {
        uint startGas = msg.gas + forwardCallGas;
        uint additionalGas = (_data.length * 50);  // 50 gas per byte;
        if (_to == 0x0) {
            return (false, false);
        }
        uint fee = calculateFeeDynamic(0, additionalGas);
        if (!_transferFee(msg.sender, fee, "Forward fee")) {
            return (false, false);
        }
        if (!_to.call.value(msg.value)(_data)) {
            _returnFee(msg.sender, fee);
            return (false, false);
        }
        return (true, _applyRefund(startGas + additionalGas));
    }

    function () payable {
        bool success;
        (success,) = _forward(allowedForwards[sha3(msg.sig)], msg.data);
        success = success || _safeFalse();
        assembly {
            mstore(0, success)
            return(0, 32)
        }
    }

    function emitTransfer(address _from, address _to, uint _value) onlyMultiAsset() {
        Transfer(_from, _to, _value);
        if (__isAllowed) {
            return;
        }
        if (feeAddress == 0x0 || _to == feeAddress || _from == feeAddress) {
            return;
        }
        if (_transferFee(_from, calculateFee(_value), "Transfer fee")) {
            return;
        }
        throw;
    }

    function emitApprove(address _from, address _spender, uint _value) onlyMultiAsset() {
        Approve(_from, _spender, _value);
        if (__isAllowed) {
            return;
        }
        if (feeAddress == 0x0 || _spender == address(this)) {
            return;
        }
        if (_transferFee(_from, calculateFee(0), "Approve fee")) {
            return;
        }
        throw;
    }
}
