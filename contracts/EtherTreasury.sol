import "Asset.sol";
import "EtherTreasuryInterface.sol";

contract EtherTreasury is Asset, EtherTreasuryInterface {
    function() {
        deposit(msg.sender);
    }
    
    function deposit(address _to) returns(bool) {
        return depositWithReference(_to, "Deposit");
    }

    function depositWithReference(address _to, string _reference) returns(bool) {
        if (balanceOf(address(this)) >= msg.value || multiAsset.reissueAsset(symbol, msg.value)) {
            return multiAsset.transferWithReference(_to, msg.value, symbol, _reference);
        }
        return false;
    }

    function _withdraw(address _to, uint _value) internal returns(bool) {
        return _to.send(_value);
    }
    
    function withdraw(address _to, uint _value) returns(bool) {
        return withdrawWithReference(_to, _value, "");
    }

    function withdrawWithReference(address _to, uint _value, string _reference) returns(bool) {
        if (multiAsset.proxyTransferWithReference(address(this), _value, symbol, _reference)) {
            return _withdraw(_to, _value);
        }
        return false;
    }

    function revokeAll() returns(bool) {
        return multiAsset.revokeAsset(symbol, balanceOf(address(this)));
    }

    function init(address _multiAsset, bytes32 _symbol) returns(bool) {
        if (address(multiAsset) != 0x0) {
            return false;
        }
        multiAsset = MultiAsset(_multiAsset);
        symbol = _symbol;
        if (multiAsset.issueAsset(symbol, 0, "WeiToken", "1-to-1 with wei.", 0, true)
            && multiAsset.setProxy(address(this), true, symbol)
            && multiAsset.setEventsProxy(address(this), symbol)
            && multiAsset.setOnlyProxy(true, symbol))
        {
            return true;
        }
        return false;
    }

    function transferWithReference(address _to, uint _value, string _reference) returns(bool) {
        if (!multiAsset.proxyTransferWithReference(_to, _value, symbol, _reference)) {
            return false;
        }
        if (_to == address(this)) {
            return _withdraw(tx.origin, _value);
        }
        return true;
    }
    
    function transferFromWithReference(address _from, address _to, uint _value, string _reference) returns(bool) {
        if (!multiAsset.proxyTransferFromWithReference(_from, _to, _value, symbol, _reference)) {
            return false;
        }
        if (_to == address(this)) {
            return _withdraw(tx.origin, _value);
        }
        return true;
    }
}