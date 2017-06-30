var WhiteListUser = artifacts.require("./WhiteListUser.sol");
var WhiteList = artifacts.require("./WhiteList.sol");
let addrList = require("../cfi-whitelist.js");
let Promise = require("bluebird");
let BigNumber = require('bignumber.js');
let assert = require('assert');
module.exports = function(done) {

    function toFinney(num) {
        assert (num >=0 && num <= 20**24-1);
        return Math.round(num * 1000);
    }

    let whiteList;
    let controlSum = new BigNumber(0);
    //return WhiteList.at("0x9411Cf70F97C2ED09325e58629D48401aEd50F89") //v0.1.0 livenet
    return WhiteList.deployed()
    .then(whiteList=>{
        //return WhiteListUser.at("0x1536f307FF0A68e1356507dDCCdfA2922A7ff48D")
        return WhiteListUser.deployed()
        .then(whiteListUser => {
            return Promise.each(addrList, (addr, n, len) => {
                return whiteListUser.assert.call(whiteList.address,addr)
                   .then(() => {
                        if (n % 100 == 99 || n == len-1) {
                            console.log('Verified ', n+1, ' addresses ');
                        }
                        controlSum = controlSum.plus(addr);
                   }).catch(()=>{
                     console.log('Failure at address', n, ', addr:',addr);
                   });
            }).then(() => Promise.all([
                whiteList.controlSum(),
                whiteList.recordNr()
            ])).spread( (_sum, _recordNr) => {
                assert.equal(_sum.toString(), controlSum.toString(), "control sum mismatch");
                assert.equal(_recordNr.toString(), addrList.length, "record num mismatch");
                console.log("verification OK");
            });
        });
    });
};
