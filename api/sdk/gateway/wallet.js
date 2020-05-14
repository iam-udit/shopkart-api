/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs');
const mkdirp = require("mkdirp");
const path = require('path');
const yaml = require('js-yaml');
const Client = require('fabric-client');
const createError = require('http-errors');
const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');

// Client section configuration
var CLIENT_CONNECTION_PROFILE_PATH = '';
// config connection profiles
const CONNECTION_PROFILE_PATH = __dirname + '/../profiles/dev-connection.yaml';


// Create a new file system based wallet for managing identities.
function createWallet(org) {
    let walletPath = path.resolve(__dirname, '../wallet');
    if ( org === 'ecom') {
        walletPath += '/ecom';
    } else if (org === 'delivery') {
        walletPath += '/delivery';
    }
    return new FileSystemWallet(walletPath);
}

// Load Connection profile and get CaUrl
function getCaURL(org){

    let caURL = "";

    if (org === 'ecom') {
        // setup ecom client
        CLIENT_CONNECTION_PROFILE_PATH = path.resolve( __dirname, '../profiles/ecom-client.yaml');
        caURL = 'http://0.0.0.0:7054';
    } else if (org === 'delivery') {
        // setup delivery client
        CLIENT_CONNECTION_PROFILE_PATH = path.resolve(__dirname, '../profiles/delivery-client.yaml');
        caURL = 'http://0.0.0.0:8054';
    }

    return caURL;
}

exports.importIdentity = async function (user, cb) {
    try {
        // Load the client section for the organization
        // This has the location of the credential store
        let caURL = getCaURL(user.org);

        // Create a new CA client for interacting with the CA.
        const ca = new FabricCAServices(caURL);

        // Create newFileSystemWallet object
        let wallet = createWallet(user.org);

        // build a user object for authenticating with the CA
        const client = Client.loadFromConfig(CONNECTION_PROFILE_PATH);
        client.loadFromConfig(CLIENT_CONNECTION_PROFILE_PATH);

        await client.initCredentialStores()
            .then((done) => {
                console.log("initCredentialStore(): ", done);
            });

        let adminUser = await client.loadUserFromStateStore('admin');

        // Check to see if we've already enrolled the admin user.
        if( adminUser === null ){
            console.log('An identity for the admin user "admin" does not exist.');
            return cb(createError(500, 'User registration failed !'));
        }

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: user.affiliation,
            enrollmentID: user.id,
            role: user.role
        }, adminUser);

        const enrollment = await ca.enroll({
            enrollmentID: user.id,
            enrollmentSecret: secret
        });

        const identity = X509WalletMixin.createIdentity(user.msp, enrollment.certificate, enrollment.key.toBytes());

        await wallet.import(user.id, identity);

        // Setup the user context
        let options = {
            username: user.id,
            mspid: user.msp,
            cryptoContent: {
                privateKeyPEM: enrollment.key.toBytes(),
                signedCertPEM: enrollment.certificate
            },
            // Set this to true to skip persistence
            skipPersistence: false
        };

        let userContext = await client.createUser(options);
        await client.setUserContext(userContext, false);
    } catch (error) {
        console.error(`Failed to register user- ${user.id} : ${error}`);
        return cb(createError(500, 'User registration failed !'));
    }
}

/**
 * Extracts the identity from the wallet
 * @param {string} org
 * @param {string} user
 */
exports.exportIdentity = async function (user, org) {

    let identity = {};

    try {
        let wallet = createWallet(org);
        // To retrive execute export
        identity = await wallet.export(user);
    } catch (e) { return {}; }

    return identity;
}

/**
 * Lists the identities in the wallet
 */
exports.listIdentities = async function (org){

    let lists = [];

    try {
        let wallet = createWallet(org);
        // Retrieve the identities in folder
        lists = await wallet.list();
    } catch (e) { return []; }

    return lists;
};

/**
 * Check identity in the wallet
 */
exports.existsIdentity = async function (user, org){

    let status = false;

    try {
        let wallet = createWallet(org);
        // Checking identity existance
        status = await wallet.exists(user);
    } catch (error) { return false; }

    return status;
};

/**
 * Lists the identities in the wallet
 */
exports.removeIdentity = async function (user, org){
    let wallet = createWallet(org);
    // removing the identity in folder
    await wallet.delete(user);
};

// Exporting the createWallet()
exports.createWallet = createWallet;
