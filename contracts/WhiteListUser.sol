pragma solidity ^0.4.11;
import  './WhiteList.sol';

contract WhiteListUser {
    WhiteList whiteList;

    function WhiteListUser(WhiteList _whiteList){
        whiteList = _whiteList;
    }

    function assert(address addr) external {
      assert (whiteList.contains(addr));
    }

}
