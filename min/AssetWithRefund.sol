pragma solidity ^0.4.9;

import "EtherTreasuryInterface.sol";
import "Ambi2EnabledFull.sol";
import "Asset.sol";

contract AssetWithRefund is Asset, Ambi2EnabledFull {
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
    EtherTreasuryInterface public treasury;
    mapping(bytes32 => address) public allowedForwards;

    function updateRefundGas() onlyRole("setup") returns(uint) {
        uint startGas = msg.gas;
        // just to simulate calculations, dunno if optimizer will remove this.
        uint refund = (startGas - msg.gas + refundGas) * tx.gasprice;
        if (tx.gasprice > txGasPriceLimit) {
            return 0;
        }
        // end.
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

    function setupTreasury(address _treasury, uint _txGasPriceLimit) payable onlyRole("admin") returns(bool) {
        if (_txGasPriceLimit == 0) {
            return _safeFalse();
        }
        treasury = EtherTreasuryInterface(_treasury);
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

    function _applyRefund(uint _startGas) internal returns(bool) {
        if (tx.gasprice > txGasPriceLimit) {
            return false;
        }
        uint refund = (_startGas - msg.gas + refundGas) * tx.gasprice;
        return _refund(refund);
    }

    function _refund(uint _value) internal returns(bool) {
        return address(treasury).call(bytes4(sha3('withdraw(address,uint256)')), tx.origin, _value);
    }

    function _transfer(address _to, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + transferCallGas;
        if (!super.transfer(_to, _value)) {
            return (false, false);
        }
        return (true, _applyRefund(startGas));
    }

    function _transferFrom(address _from, address _to, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + transferFromCallGas;
        if (!super.transferFrom(_from, _to, _value)) {
            return (false, false);
        }
        return (true, _applyRefund(startGas));
    }

    function _transferToICAP(bytes32 _icap, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + transferToICAPCallGas;
        if (!super.transferToICAP(_icap, _value)) {
            return (false, false);
        }
        return (true, _applyRefund(startGas));
    }

    function _transferFromToICAP(address _from, bytes32 _icap, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + transferFromToICAPCallGas;
        if (!super.transferFromToICAP(_from, _icap, _value)) {
            return (false, false);
        }
        return (true, _applyRefund(startGas));
    }

    function _transferWithReference(address _to, uint _value, string _reference) internal returns(bool, bool) {
        uint startGas = msg.gas + transferWithReferenceCallGas + _stringGas(_reference);
        if (!super.transferWithReference(_to, _value, _reference)) {
            return (false, false);
        }
        return (true, _applyRefund(startGas));
    }

    function _transferFromWithReference(address _from, address _to, uint _value, string _reference) internal returns(bool, bool) {
        uint startGas = msg.gas + transferFromWithReferenceCallGas + _stringGas(_reference);
        if (!super.transferFromWithReference(_from, _to, _value, _reference)) {
            return (false, false);
        }
        return (true, _applyRefund(startGas));
    }

    function _transferToICAPWithReference(bytes32 _icap, uint _value, string _reference) internal returns(bool, bool) {
        uint startGas = msg.gas + transferToICAPWithReferenceCallGas + _stringGas(_reference);
        if (!super.transferToICAPWithReference(_icap, _value, _reference)) {
            return (false, false);
        }
        return (true, _applyRefund(startGas));
    }

    function _transferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) internal returns(bool, bool) {
        uint startGas = msg.gas + transferFromToICAPWithReferenceCallGas + _stringGas(_reference);
        if (!super.transferFromToICAPWithReference(_from, _icap, _value, _reference)) {
            return (false, false);
        }
        return (true, _applyRefund(startGas));
    }

    function _approve(address _spender, uint _value) internal returns(bool, bool) {
        uint startGas = msg.gas + approveCallGas;
        if (!super.approve(_spender, _value)) {
            return (false, false);
        }
        return (true, _applyRefund(startGas));
    }

    function _setCosignerAddress(address _cosigner) internal returns(bool, bool) {
        uint startGas = msg.gas + setCosignerCallGas;
        if (!super.setCosignerAddress(_cosigner)) {
            return (false, false);
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
        uint startGas = msg.gas + forwardCallGas + (_data.length * 50); // 50 gas per byte;
        if (_to == 0x0) {
            return (false, false);
        }
        if (!_to.call.value(msg.value)(_data)) {
            return (false, false);
        }
        return (true, _applyRefund(startGas));
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
}
