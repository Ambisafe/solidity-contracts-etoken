contract UserContract {
    address public target;

    function init(address _target) {
        target = _target;
    }

    function () {
        target.call(msg.data);
    }
}