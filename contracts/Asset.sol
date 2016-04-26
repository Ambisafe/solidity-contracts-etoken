import "MultiAsset.sol";

contract Asset {
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

    function transfer(address _to, uint _value) returns(bool) {
        if (!multiAsset.proxyTransfer(_to, _value, symbol)) {
            return false;
        }
        return true;
    }

    function transferWithReference(address _to, uint _value, string _reference) returns(bool) {
        if (!multiAsset.proxyTransferWithReference(_to, _value, symbol, _reference)) {
            return false;
        }
        return true;
    }
    
    function transferFrom(address _from, address _to, uint _value) returns(bool) {
        if (!multiAsset.proxyTransferFrom(_from, _to, _value, symbol)) {
            return false;
        }
        return true;
    }

    function transferFromWithReference(address _from, address _to, uint _value, string _reference) returns(bool) {
        if (!multiAsset.proxyTransferFromWithReference(_from, _to, _value, symbol, _reference)) {
            return false;
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

    function sendToOwner() returns(bool) {
        return multiAsset.transfer(multiAsset.owner(symbol), balanceOf(address(this)), symbol);
    }
}

// RegEx to remove all admin functions from ABI: (?s)\{\s+"constant"[^[]+\[[^\]]*\][^:]+:\s*"(init|emitTransfer|emitApprove)"[^\]]+[^}]+},\s+