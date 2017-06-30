var WhiteList = artifacts.require("./WhiteList.sol");
let Promise = require("bluebird");
let BigNumber = require('bignumber.js');
let assert = require('assert');

module.exports = function(done) {

    return WhiteList.at("0x9411Cf70F97C2ED09325e58629D48401aEd50F89") // version 0.1.0: livenet
    //return WhiteList.deployed()
        .then(whiteList => {
            return Promise.all([
                whiteList.VERSION(),
                whiteList.chunkNr()
            ]).spread( (version, chunkNr) => {
                console.log('version: ',version);
                console.log('next chunkNr: ',chunkNr.toNumber());
                done();
            });
        });
};
