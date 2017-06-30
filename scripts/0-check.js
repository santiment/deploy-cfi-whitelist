var WhiteList = artifacts.require("./WhiteList.sol");
let Promise = require("bluebird");
let BigNumber = require('bignumber.js');
let assert = require('assert');

module.exports = function(done) {

    //return WhiteList.at("0x7dCB72ad13F89A3E6a97943073B03E65935e976E") // version 0.1.0: livenet
    return WhiteList.deployed()
        .then(whiteList => {
            return whiteList.chunkNr()
            .then(chunkNr => {
                console.log('next chunkNr: ',chunkNr.toNumber());
                done();
            });
        });
};
