const WhiteList = artifacts.require("./WhiteList.sol");
const addrList = require("../cfi-whitelist.js") //.slice(10); //starting from 10
const Promise = require("bluebird");
const BigNumber = require('bignumber.js');
const assert = require('assert');
const BLOCK_LEN = 230;
module.exports = function(done) {

    function toFinney(num) {
        assert (num >=0 && num <= 20**24-1);
        return Math.round(num * 1000);
    }
    let recordNum=0;
    let totalGasUsed=0;
    //return WhiteList.at("") // version 0.3.1: livenet
    return WhiteList.deployed()
        .then(whiteList => {
            const args = [];
            let cn=0;
            for(let i=0; i < addrList.length; i+= (cn++<=2)?4:BLOCK_LEN) {
                args.push(addrList.slice(i,i+(cn<=2?4:BLOCK_LEN)));
            }
            return whiteList.chunkNr()
                .then(_chunkNr => {
                    let chunkNr = _chunkNr.toNumber();
                    console.log('chunkNr> '+ chunkNr);
                    return Promise.each(args, (arg, i) => {
                        if (i >= chunkNr)
                        return whiteList.addPack.estimateGas(arg, chunkNr)
                            .then(gas => {
                                totalGasUsed+=gas;
                                process.stdout.write('Uploading chunk '+ chunkNr + ', length: ' + arg.length + ', gas: '+gas + ' ...');
                                return whiteList.addPack(arg, chunkNr++, {gas:gas}).then(function() {
                                    recordNum += arg.length;
                                    console.log(' DONE!  gas:'+gas);
                                });
                            });
                        });
                }).then(()=>{
                    console.log('\n======');
                    console.log('recordNum: ' +recordNum);
                    console.log('totalGasUsed: ' +totalGasUsed);
                    return whiteList.start();
                }).then(tx => {
                    console.log("FINALIZED.\n");
                });
        });
};
