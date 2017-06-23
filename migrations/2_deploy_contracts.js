var WhiteList = artifacts.require("./WhiteList.sol");
var WhiteListUser = artifacts.require("./WhiteListUser.sol");
module.exports = function(deployer, network) {
    deployer.deploy(WhiteList).then( function() {
        return WhiteList.deployed();
    }).then(whiteList => {
        return deployer.deploy(WhiteListUser,whiteList.address);
    });
};
