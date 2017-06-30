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
    //return WhiteList.at("0xd2675d3ea478692ad34f09fa1f8bda67a9696bf7")
    return WhiteList.deployed()
    .then(whiteList=>{
        //return WhiteListUser.at("0xE7c2AD4edfaa7d30126DD85b33be2EaD7fbDe32e")//v 0.3.1 livenet
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
            }).then(() => whiteList.controlSum()).then(_sum => {
                assert.equal(_sum.toString(),controlSum.toString(),"control sum mismatch");
                console.log("Control sum verified successfully");
            });
        });
    });
};
