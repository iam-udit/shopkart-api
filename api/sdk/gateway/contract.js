/**
 * Demonstrates the use of Gateway Network & Contract classes
 */

// Needed for reading the connection profile as JS object
const fs = require('fs');
// Used for parsing the connection profile YAML file
const yaml = require('js-yaml');
// Import gateway class
const { Gateway, FileSystemWallet } = require('fabric-network');
// Import createWallet function
const { createWallet } = require('./wallet');

// Constants for profile
const CONNECTION_PROFILE_PATH = '../profiles/dev-connection.yaml'



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
        discovery: { enabled: true, asLocalhost: true }
        /*** Uncomment lines below to disable commit listener on submit ****/
        , eventHandlerOptions: {
            strategy: null
        }
    }

    // 2.4 Connect gateway to the network
    await gateway.connect(connectionProfile, connectionOptions)

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
async function query(options) {

    // Setup gateway for connecting network and contract
    let contract = await setupGateway( options.org, options.user );

    // Query the chaincode
    let response =  await contract.evaluateTransaction(options.method, ...options.args);

    // Return query response
    return  response.toString();
}


/**
 * Creates & submit the transaction & uses the submit function
 * @param {object} options
 */
async function invoke(options) {

    // Setup gateway for connecting network and contract
    let contract = await setupGateway( options.org, options.user );

    // Provide the function name
    let txn = contract.createTransaction(options.method);

    // Get the txn ID
    console.log(txn.getTransactionID())

    // Submit the transaction
    let response = await txn.submit(...options.args);

    // Return invoke response
    return response.toString();
}


async function main() {
    let options = {
        org: "ecom",
        user: "5ea9078bf49a0e2cbcbcd749",
        method: "query",
        args: ['a']
    }
    let response = await query(options);
    console.log(response)
}
main();