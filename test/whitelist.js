const WhiteList = artifacts.require("./WhiteList.sol");
const WhiteListUser = artifacts.require("./WhiteListUser.sol");
const addrList = require("../cfi-whitelist.js");
const Promise = require("bluebird");
const BigNumber = require('bignumber.js');
const eth = require('ethereum-address');

contract('WhiteList', function(accounts) {
    let whiteList;
    let chunkNr=0;

    it('vaidate address list', function() {
        let errCounter=0;
        addrList.forEach((addr,i)=> {
            if (!eth.isAddress(addr)) {
                if (addr != "0xffb6781148D1F2b6415C25dFCA2CcafCAB4099D") {
                    console.log('invalid adress #'+i+' addr: '+addr);
                    ++errCounter;
                } else { //known invalid address in CFI list
                    console.log('WARN: known invalid adress #'+i+' addr: '+addr);
                }
            }
        });
        assert.notOk(errCounter, errCounter+' invalid adresses found!' )
    });

    it('populate addresses', function(){
        return WhiteList.deployed()
        .then(_whiteList => {
            whiteList = _whiteList;
            let BLOCK_LEN = 160;
            let promises = [];
            let args = [];
            for(let i=0; i < addrList.length; i+=BLOCK_LEN) {
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
        whiteList.addPack(extraPack, chunkNr, {gas:4700000})
        .then (tx    => done("exception expected"))
        .catch(error => done())
    });

    it("should contains all addresses if accessed by WhiteListUser.assert(addr)", function() {
        let sum = new BigNumber(0);
        return WhiteListUser.deployed().then(whiteListUser => {
            return Promise.each(addrList, (addr, n, len) => {
                return whiteListUser.assert(whiteList.address,addr)
                   .then(() => {
                        if (n % 100 == 99 || n == len-1) {
                            console.log('Verified ', n+1, ' addresses ');
                        }
                        sum = sum.plus(addr);
                   }).catch(()=>{
                     console.log('Failure at address', n, ', addr:',addr);
                   });
            }).then(() => Promise.all([
                whiteList.controlSum(),
                whiteList.recordNr(),
                whiteList.chunkNr()
            ])).spread( (_sum, _recordNr, _chunkNr) => {
                assert.equal(_sum.toString(),sum.toString(),"control sum mismatch");
                assert.equal(_recordNr.toString(),addrList.length,"total record num mismatch");
                assert.equal(_chunkNr.toString(),chunkNr.toString(),"total chunk num mismatch");
            });
        });
    });
});
