/**
 * Demonstrates the use of Gateway Network & Contract classes
 */

// Adding path module
const path = require('path');
// Needed for reading the connection profile as JS object
const fs = require('fs');
// Used for parsing the connection profile YAML file
const yaml = require('js-yaml');
// Import gateway class
const { Gateway, FileSystemWallet } = require('fabric-network');
// Import createWallet function
const { createWallet } = require('./wallet');

// Constants for profile
const CONNECTION_PROFILE_PATH = __dirname + '/../profiles/dev-connection.yaml';


/**
 * Function for setting up the gateway
 */
async function setupGateway(org, user) {

    // 1. Create an instance of the gatway
    const gateway = new Gateway();

    // 2. Setup the gateway object

    // 2.1 load the connection profile into a JS object
    let connectionProfile = yaml.safeLoad(fs.readFileSync(CONNECTION_PROFILE_PATH, 'utf8'));

    // 2.2 Need to setup the user credentials from wallet
    const wallet = createWallet(org);

    // 2.3 Set up the connection options
    let connectionOptions = {
        identity: user,
        wallet: wallet,
        discovery: { enabled: true, asLocalhost: true },
        eventHandlerOptions: {
            strategy: null
        }
    }

    // 2.4 Connect gateway to the network
    await gateway.connect(connectionProfile, connectionOptions);

    // 3. Get the network
    let network = await gateway.getNetwork(process.env.NETWORK_NAME);

    // 5. Get the contract
    const contract = await network.getContract(process.env.CONTRACT_ID);

    return contract;
}


/**
 * Queries the chaincode
 * @param {object} options
 */
exports.query =  async function (options) {

    // Setup gateway for connecting network and contract
    let contract = await setupGateway( options.org, options.user );

    // Query the chaincode
    let response =  await contract.evaluateTransaction(options.method, ...options.args);

    // Parsing and managing response
    response = JSON.parse(response);
    response.data = response.response;
    delete response.response;

    // Return query response
    return response;
};


/**
 * Creates & submit the transaction & uses the submit function
 * @param {object} options
 */
exports.invoke = async function (options) {

    // Setup gateway for connecting network and contract
    let contract = await setupGateway( options.org, options.user );

    // Provide the function name
    let txn = contract.createTransaction(options.method);

    // Submit the transaction
    let response = await txn.submit(...options.args);

    // Managing response
    response = JSON.parse(response);
    response.message = response.response;
    delete response.response;
    response.txn = await txn.getTransactionID();

    // Return invoke response
    return response;
};

