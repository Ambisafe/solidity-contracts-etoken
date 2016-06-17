contract UserContract {
    address public target;
    bool public forwarding = false;

    function init(address _target) {
        target = _target;
    }

    function () {
        if (forwarding) {
          return;
        }
        forwarding = true;
        target.call.value(msg.value)(msg.data);
        forwarding = false;
    }
}