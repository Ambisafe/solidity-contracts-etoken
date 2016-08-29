import "Safe.sol";

contract Destination {
    function recover(address _from, address _to) returns(bool);
}

contract RecoveryWithTenant is Safe {
    event Recovery(uint indexed nonce, address indexed from, address indexed to);
    event Setup(uint indexed nonce, address indexed user);
    event Error(bytes32 message);

    struct User {
        address addr;
    }

    mapping (address => uint) userIndex;
    User[] public users;

    address public oracle;
    address public tenant;
    mapping(uint => bool) nonceUsed;
    address public callDestination;


    modifier onlyOracle() {
        if (msg.sender == oracle) {
            _
        }
        Error("Oracle access denied");
    }

    function RecoveryWithTenant() {
        oracle = msg.sender;
        tenant = msg.sender;
        users.length++;
    }

    function _checkSigned(bytes32 _hash, uint _nonce, uint8 _v, bytes32 _r, bytes32 _s) internal returns(bool) {
        address recovered = ecrecover(_hash, _v, _r, _s);

        if (tenant != recovered) {
            Error("Signature not by tenant");
            return false;
        }
        if (nonceUsed[_nonce]) {
            Error("Nonce/signature used before");
            return false;
        }
        nonceUsed[_nonce] = true;
        return true;
    }

    function setOracle(address _newOracle) noValue() onlyOracle() returns(bool) {
        oracle = _newOracle;
        return true;
    }

    function configure(address _tenant, address _callDestination, uint _nonce, uint8 _v, bytes32 _r, bytes32 _s) noValue() onlyOracle() returns(bool) {
        if(tenant != oracle && !_checkSigned(sha3(_tenant, _callDestination, _nonce), _nonce, _v, _r, _s)) {
            return false;
        }
        tenant = _tenant;
        callDestination = _callDestination;
        return true;
    }

    function addUser(address _userAddr, uint _nonce, uint8 _v, bytes32 _r, bytes32 _s) noValue() onlyOracle() returns(bool) {
        if(userIndex[_userAddr] > 0) {
            Error("User already exists");
            return false;
        }
        if(!_checkSigned(sha3(_userAddr, _nonce), _nonce, _v, _r, _s)) {
            return false;
        }
        uint posUser = users.length++;
        userIndex[_userAddr] = posUser;
        users[posUser] = User(_userAddr);
        Setup(_nonce, _userAddr);
        return true;
    }

    function recoverUser(address _oldAddr, address _newAddr, uint _nonce, uint8 _v, bytes32 _r, bytes32 _s) noValue() onlyOracle() returns(bool) {
        uint userPos = userIndex[_oldAddr];
        if (userPos == 0) {
            Error("User does not exist");
            return false;
        }
        if (!_checkSigned(sha3(_oldAddr, _newAddr, _nonce), _nonce, _v, _r, _s)) {
            return false;
        }
        bool result = Destination(callDestination).recover(_oldAddr, _newAddr);
        if (result) {
            users[userPos].addr = _newAddr;
            delete userIndex[_oldAddr];
            userIndex[_newAddr] = userPos;
            Recovery(_nonce, _oldAddr, _newAddr);
            return true;
        }
        Error("Contract call failed");
        return false;
    }

    function () noValue() {
        Error("Fallback function");
    }

    function isUser(address _userAddr) constant returns(bool) {
        return (userIndex[_userAddr] > 0);
    }
}