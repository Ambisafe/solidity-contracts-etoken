import "Asset.sol";
import "EtherTreasuryInterface.sol";

contract EtherTreasury is Asset, EtherTreasuryInterface {
    bool private isWithdraw = false;

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

    function _withdraw(address _to, uint _value) internal noValue() returns(bool) {
        return safeSend(_to, _value);
    }
    
    function withdraw(address _to, uint _value) returns(bool) {
        return withdrawWithReference(_to, _value, "");
    }

    function withdrawWithReference(address _to, uint _value, string _reference) returns(bool) {
        isWithdraw = true;
        if (super.transferWithReference(address(this), _value, _reference)) {
            return _withdraw(_to, _value);
        }
        return false;
    }

    function revokeAll() noValue() returns(bool) {
        return multiAsset.revokeAsset(symbol, balanceOf(address(this)));
    }

    function init(address _multiAsset, bytes32 _symbol) noValue() returns(bool) {
        if (address(multiAsset) != 0x0) {
            return false;
        }
        multiAsset = MultiAsset(_multiAsset);
        symbol = _symbol;
        if (multiAsset.issueAsset(symbol, 0, "WeiToken", "1-to-1 with wei.", 0, true)
            && multiAsset.setProxy(address(this), true, symbol)
            && multiAsset.setEventsProxy(address(this), symbol))
        {
            return true;
        }
        return false;
    }

    function emitTransfer(address _from, address _to, uint _value) {
        super.emitTransfer(_from, _to, _value);
        if (_to == address(this)) {
            if (!isWithdraw) {
                throw;
            }
            isWithdraw = false;
        }
    }
}