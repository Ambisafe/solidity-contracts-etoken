contract EtherTreasuryNano {
    uint public walletsCount = 1; 
    mapping(address => uint) public wallets;
    mapping(uint => uint) public balances;

    function() {
        deposit(msg.sender);
    }
    
    function deposit(address _to) returns(bool) {
        if (wallets[_to] == 0) {
            wallets[_to] = walletsCount++;
        }
        balances[wallets[_to]] += msg.value;
        return true;
    }

    function depositWithReference(address _to, string _reference) returns(bool) {
        deposit(_to);
        Deposit(msg.sender, _to, msg.value, _reference);
        return true;
    }

    function withdraw(address _to, uint _value) returns(bool) {
        if (balances[wallets[msg.sender]] < _value) {
            return false;
        }
        balances[wallets[msg.sender]] -= _value;
        return _to.send(_value);
    }

    function withdrawWithReference(address _to, uint _value, string _reference) returns(bool) {
        if(!withdraw(_to, _value)) {
            return false;
        }
        Withdrawal(msg.sender, _to, _value, _reference);
        return true;
    }

    function balanceOf(address _holder) constant returns(uint) {
        return balances[wallets[_holder]];
    }

    function addAddress(address _address) returns(bool) {
        wallets[_address] = wallets[msg.sender];
        return true;
    }

    function removeAddress(address _address) returns(bool) {
        if (wallets[_address] != wallets[msg.sender]) {
            return false;
        }
        delete wallets[_address];
        return true;
    }

    event Deposit(address indexed from, address indexed to, uint value, string reference);
    event Withdrawal(address indexed from, address indexed to, uint value, string reference);
}