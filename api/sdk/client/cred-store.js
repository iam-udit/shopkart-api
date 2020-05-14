/**
 * Demonstrates the setup of the credential store
 */
const fs = require('fs');
const Client = require('fabric-client');

// Constants for profile, wallet & user
const CONNECTION_PROFILE_PATH = __dirname + '/../profiles/dev-connection.yaml';

// Client section configuration
const ECOM_CLIENT_CONNECTION_PROFILE_PATH = __dirname + '/../profiles/ecom-client.yaml';
const DELIVERY_CLIENT_CONNECTION_PROFILE_PATH = __dirname + '/../profiles/delivery-client.yaml';

// Creating and initializing client object
const client = Client.loadFromConfig(CONNECTION_PROFILE_PATH);


/**
 * Creates the MSP ID from the org name for 'acme' it will be 'AcmeMSP'
 * @param {string} org 
 */
function createMSPId(org) {
    return org+'MSP';
}

/**
 * Reads content of the certificate
 * @param {string} org
 * @param {string} user
 */
function getCertPath(org, user) {
    var certPath = process.env.CRYPTO_CONFIG_PEER_ORGANIZATIONS + "/" + org + "/" + user + "/msp/signcerts/cert.pem";
    return certPath;
}

/**
 * Reads the content of users private key
 * @param {string} org
 * @param {string} user
 */
function getPrivateKeyPath(org, user) {
    let pkFolder = process.env.CRYPTO_CONFIG_PEER_ORGANIZATIONS + "/" + org + "/" + user + "/msp/keystore";
    let pkFile = '';
    fs.readdirSync(pkFolder).forEach((file) => {
        // return the first file
        pkFile = file;
        return;
    })
    return (pkFolder + "/" + pkFile);
}

/**
 * Initialize the file system credentials store
 */
async function initCredentialStore() {

    // Call the function for initializing the credentials store on file system
    await client.initCredentialStores()
        .then((done) => {
            console.log("initCredentialStore(): ", done);
        });
}

// Load the client section for the organization
function loadConfig(org, client){
    if(org === 'ecom'){
        // setup ecom client
        client.loadFromConfig(ECOM_CLIENT_CONNECTION_PROFILE_PATH);
    } else if(org === 'delivery'){
        // setup delivery client
        client.loadFromConfig(DELIVERY_CLIENT_CONNECTION_PROFILE_PATH);
    } else {
        console.log("Unknown organization:", org);
        process.exit(1);
    }
}

/**
 * Setup the user context
 **/
async function createUserContext(org, user) {
    // Get the path  to user private key
    let privateKeyPath = getPrivateKeyPath(org, user);

    // Get the path to the user certificate
    let certPath = getCertPath(org, user);

    // Setup the options for the user context
    // Global Type: UserOpts
    let opts = {
        username: user,
        mspid: createMSPId(org),
        cryptoContent: {
            privateKey: privateKeyPath,
            signedCert: certPath
        },
        // Set this to true to skip persistence
        skipPersistence: false
    };

    // Setup the user
    let userContext = await client.createUser(opts);

    return userContext;
}


// Main function for setupCredStore
async function setupCredStore(org, user){

    // Check if org and name are provided
    if (org === 'undefined' || user === 'undefined'){
        console.log("Usage:  setupCredStore(org,user)");
        process.exit(1);
    }

    // Load the client section for the organization
    // This has the location of the credential store
    loadConfig(org, client);

    // Initialize the store
    await initCredentialStore();

    // Lets get the specified user from the store
    let userContext = await client.loadUserFromStateStore(user);

    // If user is null then the user does not exist
    if( userContext === null ){

        // Create the user context
        userContext = await createUserContext(org, user);
        console.log(`Created ${user} for ${org} under the wallet !!!`);

    } else {
        console.log(`User ${org}: ${user} already exist !!!`);
    }

    // Setup the context on the client
    await client.setUserContext(userContext, false);
}


module.exports = setupCredStore;