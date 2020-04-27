/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { createWallet } = require('./wallet');
const { Gateway, FileSystemWallet } = require('fabric-network');

// Constants for profile
const CONNECTION_PROFILE_PATH = __dirname + '/../profiles/dev-connection.yaml'
// Path to the wallet
const FILESYSTEM_WALLET_PATH = '../wallet/ecom'
// Identity context used
const USER_ID = 'zaack100@gmail.com';
// Channel name
const NETWORK_NAME = 'ecomchannel'
// Chaincode
const CONTRACT_ID = "gocc";

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, 'connection-profile.yaml');
        //const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const ccp = fs.readFileSync(ccpPath, 'utf8')

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('ecomchannel');

        // Get the contract from the network.
        const contract = network.getContract('test');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        var args = ['a'];
        const result = await contract.evaluateTransaction('query', ...args);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();