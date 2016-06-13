import "MultiAsset.sol";
import "Safe.sol";

contract ExampleIssuer is Owned, Safe {
    MultiAsset public multiAsset;
    bytes32 public symbol;

    function init(address _multiAsset, bytes32 _symbol, string _name, string _description, uint8 _baseUnit) noValue() onlyContractOwner() returns(bool) {
        MultiAsset ma = MultiAsset(_multiAsset);
        if (address(multiAsset) != 0x0 || ma.isCreated(_symbol)) {
            return false;
        }
        multiAsset = ma;
        symbol = _symbol;
        multiAsset.issueAsset(_symbol, 0, _name, _description, _baseUnit, true);
        return true;
    }

    function initProxy(address _proxy) noValue() onlyContractOwner() returns(bool) {
        if (!multiAsset.setProxy(_proxy, true, symbol)) {
            return false;
        }
        return multiAsset.setEventsProxy(_proxy, symbol);
    }

    function request() noValue() returns(bool) {
        if (!multiAsset.reissueAsset(symbol, 10000)) {
            return false;
        }
        return multiAsset.transfer(msg.sender, 10000, symbol);
    }
}

// RegEx to remove all admin functions from ABI: (?s)\{\s+"constant"[^[]+\[[^\]]*\][^:]+:\s*"(init|initProxy)"[^\]]+[^}]+},\s+
