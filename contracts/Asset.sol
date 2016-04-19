import "MultiAsset.sol";

contract Asset {
    event Transfer(address indexed from, address indexed to, uint value);
    event Approve(address indexed from, address indexed spender, uint value);

    MultiAsset multiAsset;
    bytes32 symbol;

    // DEPLOY REMOVE START
    function init(address _multiAsset, bytes32 _symbol) {
        multiAsset = MultiAsset(_multiAsset);
        symbol = _symbol;
    }
    // DEPLOY REMOVE END

    function Asset(address _multiAsset, bytes32 _symbol) {
        multiAsset = MultiAsset(_multiAsset);
        symbol = _symbol;
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
        if (!multiAsset.proxyTransfer(_to, _value, symbol, msg.sender)) {
            return false;
        }
        return true;
    }

    function transferWithReference(address _to, uint _value, string _reference) returns(bool) {
        if (!multiAsset.proxyTransferWithReference(_to, _value, symbol, _reference, msg.sender)) {
            return false;
        }
        return true;
    }
    
    function transferFrom(address _from, address _to, uint _value) returns(bool) {
        if (!multiAsset.proxyTransferFrom(_from, _to, _value, symbol, msg.sender)) {
            return false;
        }
        return true;
    }

    function transferFromWithReference(address _from, address _to, uint _value, string _reference) returns(bool) {
        if (!multiAsset.proxyTransferFromWithReference(_from, _to, _value, symbol, _reference, msg.sender)) {
            return false;
        }
        return true;
    }

    function approve(address _spender, uint _value) returns(bool) {
        if (!multiAsset.proxyApprove(_spender, _value, symbol, msg.sender)) {
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