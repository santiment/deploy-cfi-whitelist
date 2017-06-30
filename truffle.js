module.exports = {
    networks: {
        live: {
            host: "localhost",
            port: 8545,
            network_id: 1,
            gas: 6700000,
            gasPrice: "10000000000"
           ,from: "0x008F8272ABFAC620E80393BF0cf23A01fDdf6667"
        },
        development: {
          host: "localhost",
          gas: 6700000,
          port: 8555,
          network_id: "*" // Match any network id
        }
    }
};
