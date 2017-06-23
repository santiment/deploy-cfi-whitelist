var WhiteList = artifacts.require("./WhiteList.sol");
var WhiteListUser = artifacts.require("./WhiteListUser.sol");
var addrList = require("../cfi-whitelist.js");
var Promise = require("bluebird");
var BigNumber = require('bignumber.js');

contract('WhiteList', function(accounts) {
    let whiteList;
    let chunkNr=0;
    before('populate addresses', function(){
        return WhiteList.deployed()
        .then(_whiteList => {
            whiteList = _whiteList;
            let BLOCK_LEN = 160;
            let promises = [];
            let args = [];
            for(var i=0; i < addrList.length; i+=BLOCK_LEN) {
                args.push(addrList.slice(i,i+BLOCK_LEN));
            }
            return Promise.each(args, function(arg) {
                return whiteList.addPack(arg, chunkNr++, {gas:4600000}).then(function() {
                  console.log('Uploaded chunk ', chunkNr-1, ', length: ', arg.length);
                });
            }).then(()=>whiteList.start());
        });
    });

    it("should be impossible to add more addresses after start (setupMode==false)", function(done) {
        let extraPack = [whiteList.address];
        whiteList.addPack(extraPack, chunkNr++, {gas:4700000})
        .then (tx    => done("exception expected"))
        .catch(error => done())
    });

    it("should contains all addresses if accessed by WhiteListUser.assert(addr)", function() {
        let sum = new BigNumber(0);
        return WhiteListUser.deployed().then(whiteListUser => {
            return Promise.each(addrList, (addr, n, len) => {
                return whiteListUser.assert(addr)
                   .then(() => {
                        if (n % 100 == 99 || n == len-1) {
                            console.log('Verified ', n+1, ' addresses ');
                        }
                        sum = sum.plus(addr);
                   }).catch(()=>{
                     console.log('Failure at address', n, ', addr:',addr);
                   });
            }).then(() => whiteList.sum()).then(_sum => {
                assert.equal(_sum.toString(),sum.toString(),"control sum mismatch");
            });
        });
    });
});
