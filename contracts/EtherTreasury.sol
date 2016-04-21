import "MultiAsset.sol";

contract EtherTreasury {
    function _deposit(address _to, uint _value) internal returns(bool) {
        if (multiAsset.reissueAsset(symbol, _value)) {
            return _transfer(address(this), _to, _value);
        }
        return false;
    }
    
    function() {
        deposit();
    }
    
    function deposit(address _to) returns(bool) {
        return _deposit(_to, msg.value);
    }

    function deposit() returns(bool) {
        return _deposit(msg.sender, msg.value);
    }

    function _withdraw(address _to, uint _value) internal returns(bool) {
        return _to.send(_value);
    }
    
    function withdraw(address _to, uint _value) returns(bool) {
        if (multiAsset.proxyTransferDirect(msg.sender, address(this), _value, symbol, "Withdraw")) {
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

    function _transfer(address _from, address _to, uint _value) returns(bool) {
        if (!multiAsset.proxyTransfer(_to, _value, symbol, _from)) {
            return false;
        }     
        return true;
    }

    function transfer(address _to, uint _value) returns(bool) {
        if (!_transfer(msg.sender, _to, _value)) {
            return false;
        }
        if (_to == address(this)) {
            return _withdraw(msg.sender, _value);
        }
        return true;
    }

    function transferWithReference(address _to, uint _value, string _reference) returns(bool) {
        if (!multiAsset.proxyTransferWithReference(_to, _value, symbol, _reference, msg.sender)) {
            return false;
        }
        if (_to == address(this)) {
            return _withdraw(msg.sender, _value);
        }
        return true;
    }

    function _transferFrom(address _from, address _to, uint _value) internal returns(bool) {
        if (!multiAsset.proxyTransferFrom(_from, _to, _value, symbol, msg.sender)) {
            return false;
        }
        return true;
    }
    
    function transferFrom(address _from, address _to, uint _value) returns(bool) {
        if (!_transferFrom(_from, _to, _value)) {
            return false;
        }
        if (_to == address(this)) {
            return _withdraw(msg.sender, _value);
        }
        return true;
    }

    function transferFromWithReference(address _from, address _to, uint _value, string _reference) returns(bool) {
        if (!multiAsset.proxyTransferFromWithReference(_from, _to, _value, symbol, _reference, msg.sender)) {
            return false;
        }
        if (_to == address(this)) {
            return _withdraw(msg.sender, _value);
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