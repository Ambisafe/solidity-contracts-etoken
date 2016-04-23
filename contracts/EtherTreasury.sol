import "MultiAsset.sol";

contract EtherTreasury {
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
        if (multiAsset.issueAsset(symbol, 0, "WeiToken", "1-to-1 with wei. ATTENTION: NOT safe to hold tokens buy real person. Cosinging will not be checked! Use only for contracts!", 0, true)
            && multiAsset.setProxy(address(this), true, symbol)
            && multiAsset.setEventsProxy(address(this), symbol)
            && multiAsset.setOnlyProxy(true, symbol))
        {
            return true;
        }
        return false;
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

    function transfer(address _to, uint _value) returns(bool) {
        if (!multiAsset.proxyTransfer(_to, _value, symbol)) {
            return false;
        }
        if (_to == address(this)) {
            return _withdraw(tx.origin, _value);
        }
        return true;
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
    
    function transferFrom(address _from, address _to, uint _value) returns(bool) {
        if (!multiAsset.proxyTransferFrom(_from, _to, _value, symbol)) {
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

    function approve(address _spender, uint _value) returns(bool) {
        if (!multiAsset.proxyApprove(_spender, _value, symbol)) {
            return false;
        }
        return true;
    }

    function emitTransfer(address _from, address _to, uint _value) onlyMultiAsset() {
        Transfer(_from, _to, _value);
    }

    function emitApprove(address _from, address _spender, uint _value) onlyMultiAsset() {
        Approve(_from, _spender, _value);
    }
}