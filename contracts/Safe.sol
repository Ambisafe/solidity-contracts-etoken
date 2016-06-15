contract Safe {
    modifier noValue {
      if (msg.value > 1) {
        throw;
      }
      _
    }

    modifier onlyHuman {
      if (isHuman()) {
        _
      }
    }

    function safeFalse() noValue() returns(bool) {
      return false;
    }

    function safeSend(address _to, uint _value) {
      if (!unsafeSend(_to, _value)) {
        throw;
      }
    }

    function unsafeSend(address _to, uint _value) returns(bool) {
      return _to.call.value(_value)();
    }

    function isContract() constant returns(bool) {
      return msg.sender != tx.origin;
    }

    function isHuman() constant returns(bool) {
      return !isContract();
    }
}