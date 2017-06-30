pragma solidity ^0.4.11;
contract WhiteList {
    string public constant VERSION = "0.1.0";

    mapping(address=>bool) public contains;
    uint16  public chunkNr = 0;
    uint256 public controlSum = 0;
    bool public isSetupMode = true;

    //adds next address package to the internal white list.
    //call valid only in setup mode.
    function addPack(address[] addrs, uint16 _chunkNr)
    setupOnly
    external {
        require ( chunkNr++ == _chunkNr);
        for(uint16 i=0; i<addrs.length; ++i){
            contains[addrs[i]] = true;
            controlSum += uint160(addrs[i]);
        }
    }

    //disable setup mode
    function start() public {
        isSetupMode = false;
    }

    modifier setupOnly {
        if (!isSetupMode) throw;
        _;
    }
}
