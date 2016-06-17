contract Safe {
    modifier noValue {
      if (msg.value > 0 && !msg.sender.send(msg.value)) {
        throw;
      }
      _
    }

    modifier onlyHuman {
      if (_isHuman()) {
        _
      }
    }

    modifier noCallback {
      if (!isCall) {
        _
      }
    }

    function _safeFalse() noValue() internal returns(bool) {
      return false;
    }

    function _safeSend(address _to, uint _value) internal {
      if (!_unsafeSend(_to, _value)) {
        throw;
      }
    }

    function _unsafeSend(address _to, uint _value) internal returns(bool) {
      return _to.call.value(_value)();
    }

    function _isContract() constant internal returns(bool) {
      return msg.sender != tx.origin;
    }

    function _isHuman() constant internal returns(bool) {
      return !_isContract();
    }

    bool private isCall = false;
    function _setupNoCallback() internal {
      isCall = true;
    }

    function _finishNoCallback() internal {
      isCall = false;
    }
}