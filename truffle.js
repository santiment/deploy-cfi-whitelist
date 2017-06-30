module.exports = {
    networks: {
        live: {
            host: "localhost",
            port: 8545,
            network_id: 1,
            gas: 6700000,
            gasPrice: "21000000000"
            //,from: "ADDRESS"
        },
        development: {
          host: "localhost",
          gas: 6700000,
          port: 8555,
          network_id: "*" // Match any network id
        }
    }
};
