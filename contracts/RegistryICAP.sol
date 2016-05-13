contract RegistryICAP {
    //ICAP.toAsset('XE81ETHXREGGAVOFYORK')
    // returns {
    //   asset: 'ETH',
    //   institution: 'XREG',
    //   client: 'GAVOFYORK'
    // }
    function decodeIndirect(bytes _bban) returns(string, string, string, bool) {
        if (_bban.length != 16) {
            return ("","","",false);
        }
        bytes memory asset = new bytes(3);
        bytes memory institution = new bytes(4);
        bytes memory client = new bytes(9);
         
        uint k = 0;
         
        for (uint i = 0; i < asset.length; i++) {
            asset[i] = _bban[k++];
        }
        for (i = 0; i < institution.length; i++) {
            institution[i] = _bban[k++];
        }
        for (i = 0; i < client.length; i++) {
            client[i] = _bban[k++];
        }
        return (string(asset), string(institution), string(client), true);
    }

    function parse(bytes32 _icap) constant returns(address, bytes32, bool) {
        bytes memory bban = new bytes(16);
        for (uint i = 0; i < 16; i++) {
             bban[i] = _icap[i + 4];
        }
        var (asset, institution, _, success) = decodeIndirect(bban);
        if (!success) {
            return (0,0,false);
        }
        
        bytes32 institutionHash = sha3(asset, institution);
        return (institutions[institutionHash], assets[sha3(asset)], registered[institutionHash]);
    }
    
    mapping(bytes32 => bool) public registered;
    mapping(bytes32 => address) public institutions;
    mapping(bytes32 => bytes32) public assets;

    function registerInstitution(string _asset, string _institution, address _address) returns(bool) {
        if (assets[sha3(_asset)] == 0x0) {
            return false;
        }
        bytes32 institutionHash = sha3(_asset, _institution);
        if (registered[institutionHash]) {
            return false;
        }
        registered[institutionHash] = true;
        institutions[institutionHash] = _address;
        return true;
    }

    function registerAsset(string _asset, bytes32 _symbol) returns(bool) {
        bytes32 asset = sha3(_asset);
        if (assets[asset] != 0x0) {
            return false;
        }
        assets[asset] = _symbol;
        return true;
    }
}