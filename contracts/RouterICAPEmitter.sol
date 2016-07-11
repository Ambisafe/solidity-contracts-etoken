import "EventsHistory.sol";

library RouterICAPEmitter {
    event TransferToICAP(address indexed from, address indexed to, bytes32 indexed icap, uint value, string reference, uint version);
    event Error(bytes32 message, uint version);
    
    function emitTransferToICAP(address _from, address _to, bytes32 _icap, uint _value, string _reference) {
        TransferToICAP(_from, _to, _icap, _value, _reference, _getVersion());
    }

    function emitError(bytes32 _message) {
        Error(_message, _getVersion());
    }

    function _getVersion() constant internal returns(uint) {
        return EventsHistory(address(this)).versions(msg.sender);
    }
}