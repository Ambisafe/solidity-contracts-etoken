import "EtherTreasuryInterface.sol";
import "Asset.sol";
import "AmbiEnabled.sol";

contract AssetWithExchange is Asset, AmbiEnabled {
    uint public tokenPriceInWeiSell = 1;
    uint public tokenPriceInWeiBuy = 2;
    uint public buyLimitMin = 0;
    uint public buyLimitMax = 0;
    uint public sellLimitMin = 0;
    uint public sellLimitMax = 0;
    address public exchangeAddress;
    EtherTreasuryInterface public treasury;

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

    function setupTreasury(address _treasury) checkAccess("admin") returns(bool) {
        treasury = EtherTreasuryInterface(_treasury);
        if (msg.value > 0) {
            safeSend(_treasury, msg.value);
        }
        return true;
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

// RegEx to remove all admin functions from ABI: (?s)\{\s+"constant"[^[]+\[[^\]]*\][^:]+:\s*"(setupExchange|setTokenPrice|setWholeTokenPrice|setupTreasury|treasury)"[^\]]+[^}]+},\s+