contract Fake {
    uint public calls;

    function withdraw(address _to, uint _value) returns(bool) {
        calls++;
        return true;
    }
}