// pragma solidity ^0.4.4;

// import "SafeMin.sol";

// contract MultiAsset {
//     function setupRegistryICAP(address _registryICAP) returns(bool);
//     function setupEventsHistory(address _eventsHistory) returns(bool);
//     function isCreated(bytes32 _symbol) constant returns(bool);
//     function baseUnit(bytes32 _symbol) constant returns(uint8);
//     function name(bytes32 _symbol) constant returns(string);
//     function description(bytes32 _symbol) constant returns(string);
//     function isReissuable(bytes32 _symbol) constant returns(bool);
//     function owner(bytes32 _symbol) constant returns(address);
//     function isOwner(address _owner, bytes32 _symbol) constant returns(bool);
//     function totalSupply(bytes32 _symbol) constant returns(uint);
//     function balanceOf(address _holder, bytes32 _symbol) constant returns(uint);
//     function setProxy(address _address, bool enabled, bytes32 _symbol) returns(bool);
//     function setEventsProxy(address _address, bytes32 _symbol) returns(bool);
//     function setProxyConf(bool _onlyThroughProxy, bool _throwOnFailedEmit, bytes32 _symbol) returns(bool);
//     function transfer(address _to, uint _value, bytes32 _symbol) returns(bool);
//     function transferToICAP(bytes32 _icap, uint _value) returns(bool);
//     function transferToICAPWithReference(bytes32 _icap, uint _value, string _reference) returns(bool);
//     function transferWithReference(address _to, uint _value, bytes32 _symbol, string _reference) returns(bool);
//     function proxyTransferWithReference(address _to, uint _value, bytes32 _symbol, string _reference) returns(bool);
//     function proxyTransferToICAPWithReference(bytes32 _icap, uint _value, string _reference) returns(bool);
//     function getHolderId(address _holder) constant returns(uint);
//     function issueAsset(bytes32 _symbol, uint _value, string _name, string _description, uint8 _baseUnit, bool _isReissuable) returns(bool);
//     function reissueAsset(bytes32 _symbol, uint _value) returns(bool);
//     function revokeAsset(bytes32 _symbol, uint _value) returns(bool);
//     function changeOwnership(bytes32 _symbol, address _newOwner) returns(bool);
//     function isTrusted(address _from, address _to) constant returns(bool);
//     function trust(address _to) returns(bool);
//     function distrust(address _to) returns(bool);
//     function distrustAll() returns(bool);
//     function recover(address _from, address _to) returns(bool);
//     function approve(address _spender, uint _value, bytes32 _symbol) returns(bool);
//     function proxyApprove(address _spender, uint _value, bytes32 _symbol) returns(bool);
//     function allowance(address _from, address _spender, bytes32 _symbol) constant returns(uint);
//     function transferFrom(address _from, address _to, uint _value, bytes32 _symbol) returns(bool);
//     function transferFromWithReference(address _from, address _to, uint _value, bytes32 _symbol, string _reference) returns(bool);
//     function transferFromToICAP(address _from, bytes32 _icap, uint _value) returns(bool);
//     function transferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) returns(bool);
//     function proxyTransferFromWithReference(address _from, address _to, uint _value, bytes32 _symbol, string _reference) returns(bool);
//     function proxyTransferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) returns(bool);
//     function setCosignerAddress(address _address, bytes32 _symbol) returns(bool);
//     function setCosignerAddressForUser(address _address) returns(bool);
//     function proxySetCosignerAddress(address _address, bytes32 _symbol) returns(bool);
// }

// contract AssetMin is SafeMin {
//     event Transfer(address indexed from, address indexed to, uint value);
//     event Approve(address indexed from, address indexed spender, uint value);

//     MultiAsset public multiAsset;
//     bytes32 public symbol;
//     string public name;

//     function init(address _multiAsset, bytes32 _symbol) immutable(address(multiAsset)) returns(bool) {
//         MultiAsset ma = MultiAsset(_multiAsset);
//         if (!ma.isCreated(_symbol)) {
//             return false;
//         }
//         multiAsset = ma;
//         symbol = _symbol;
//         return true;
//     }

//     function setName(string _name) returns(bool) {
//         if (bytes(name).length != 0) {
//             return false;
//         }
//         name = _name;
//         return true;
//     }

//     modifier onlyMultiAsset() {
//         if (msg.sender == address(multiAsset)) {
//             _;
//         }
//     }

//     function totalSupply() constant returns(uint) {
//         return multiAsset.totalSupply(symbol);
//     }

//     function balanceOf(address _owner) constant returns(uint) {
//         return multiAsset.balanceOf(_owner, symbol);
//     }

//     function allowance(address _from, address _spender) constant returns(uint) {
//         return multiAsset.allowance(_from, _spender, symbol);
//     }

//     function transfer(address _to, uint _value) returns(bool) {
//         return __transferWithReference(_to, _value, "");
//     }

//     function transferWithReference(address _to, uint _value, string _reference) returns(bool) {
//         return __transferWithReference(_to, _value, _reference);
//     }

//     function __transferWithReference(address _to, uint _value, string _reference) private returns(bool) {
//         return _isHuman() ?
//             multiAsset.proxyTransferWithReference(_to, _value, symbol, _reference) :
//             multiAsset.transferFromWithReference(msg.sender, _to, _value, symbol, _reference);
//     }

//     function transferToICAP(bytes32 _icap, uint _value) returns(bool) {
//         return __transferToICAPWithReference(_icap, _value, "");
//     }

//     function transferToICAPWithReference(bytes32 _icap, uint _value, string _reference) returns(bool) {
//         return __transferToICAPWithReference(_icap, _value, _reference);
//     }

//     function __transferToICAPWithReference(bytes32 _icap, uint _value, string _reference) private returns(bool) {
//         return _isHuman() ?
//             multiAsset.proxyTransferToICAPWithReference(_icap, _value, _reference) :
//             multiAsset.transferFromToICAPWithReference(msg.sender, _icap, _value, _reference);
//     }
    
//     function __transferFromWithReference(address _from, address _to, uint _value, string _reference) private onlyHuman() returns(bool) {
//         return multiAsset.proxyTransferFromWithReference(_from, _to, _value, symbol, _reference);
//     }

//     function __transferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) private onlyHuman() returns(bool) {
//         return multiAsset.proxyTransferFromToICAPWithReference(_from, _icap, _value, _reference);
//     }

//     function approve(address _spender, uint _value) onlyHuman() returns(bool) {
//         return multiAsset.proxyApprove(_spender, _value, symbol);
//     }

//     function setCosignerAddress(address _cosigner) onlyHuman() returns(bool) {
//         return multiAsset.proxySetCosignerAddress(_cosigner, symbol);
//     }

//     function emitTransfer(address _from, address _to, uint _value) onlyMultiAsset() {
//         Transfer(_from, _to, _value);
//     }

//     function emitApprove(address _from, address _spender, uint _value) onlyMultiAsset() {
//         Approve(_from, _spender, _value);
//     }

//     function sendToOwner() returns(bool) {
//         address owner = multiAsset.owner(symbol);
//         return multiAsset.transfer(owner, balanceOf(owner), symbol);
//     }

//     function decimals() constant returns(uint8) {
//         return multiAsset.baseUnit(symbol);
//     }
// }

// // RegEx to remove all admin functions from ABI: (?s)\{\s+"constant"[^[]+\[[^\]]*\][^:]+:\s*"(init|emitTransfer|emitApprove|sendToOwner)"[^\]]+[^}]+},\s+
