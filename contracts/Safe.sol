contract Safe {
    modifier noValue {
      if (msg.value > 1) {
        throw;
      }
      _
    }

    function safeFalse() returns(bool) {
      if (msg.value > 1) {
        throw;
      }
      return false;
    }

    function safeSend(address _to, uint _value) returns(bool) {
      if (!_to.send(_value)) {
        throw;
      }
      return true;
    }
}