contract CosignEnabled {

    uint public signChecks;

    modifier checkSigned(bytes32 _opHash) {
        signChecks++;
        _
    }

}