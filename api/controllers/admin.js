// Importing all required files
const createError = require('http-errors');
const contract = require('../sdk/gateway/contract');

// Initializing EcomToken for the Organization
exports.initEcomToken = async function (req, res, next) {

    // Getting totalSupply from request
    let totalSupply = req.body.totalSupply;

    try{
        let options = {
            org: "ecom",
            user: 'admin',
            method: "CreateToken",
            args: [totalSupply.toString()]
        }
        //  Generating ecom-token
        let result = await contract.invoke(options);

        // Returnng success response
        await res.status(result.status).json({
            status: result.status,
            message: "Token created successfully",
            metaData: {
                token: 'ecomtoken',
                admin: result.txn._admin,
                totalSupply: totalSupply,
                txnId: result.txn._transaction_id
            }
        });

    } catch (e) {
        next(createError(500, 'Failed to initalize token !'));
    }
}

// Adding EcomToken for the Organization
exports.addEcomToken = async function (req, res, next) {

    // Getting tokenAmount from request
    let tokenAmount = req.body.tokenAmount;

    try{
        let options = {
            org: "ecom",
            user: 'admin',
            method: "AddToken",
            args: [tokenAmount.toString()]
        }
        //  Adding ecom-token
        let result = await contract.invoke(options);

        // Returnng success response
        await res.status(result.status).json({
            status: result.status,
            message: "Token added successfully",
            metaData: {
                token: 'ecomtoken',
                admin: result.txn._admin,
                tokenAmount: tokenAmount,
                txnId: result.txn._transaction_id
            }
        });

    } catch (error) {
        if (error.message)
            next(createError(404, "Token doesn't exists !"));
        else
            next(createError(500, 'Failed to add token !'));
    }
}

// Checking total token supplied
exports.getTotalSupply = async function (req, res, next) {

    try{
        let options = {
            org: "ecom",
            user: 'admin',
            method: "TotalSupply",
            args: []
        }

        //  Getting totalSupply
        let result = await contract.query(options);

        // Returnng totalSupply
        await res.status(result.status).json({
            status: result.status,
            totalSupply: parseFloat(result.data),
            message: "Total token supplied details",
        });

    } catch (error) {
        if (error.message)
            next(createError(404, "Token doesn't exists !"));
        else
            next(createError(500, 'Failed to get total supply !'));
    }
}

// Checking token supply availability
exports.getAvailableSupply = async function (req, res, next) {

    try{
        let options = {
            org: "ecom",
            user: 'admin',
            method: "AvailableSupply",
            args: []
        }

        //  Getting available supply
        let result = await contract.query(options);

        // Returnng availableSupply
        await res.status(result.status).json({
            status: result.status,
            availableSupply: parseFloat(result.data),
            message: "Available token supply details",
        });

    } catch (error) {
        if (error.message)
            next(createError(404, "Token doesn't exists !"));
        else
            next(createError(500, 'Failed to get available supply !'));
    }
}

// set wallet balance/ purchase token
exports.setWalletBalance = async function (req, res, next) {

    let options =  {};

    // Checking user eligibility
    if ( req.userData.role != 'seller' && req.userData.role != 'logistic'){
        return  next(createError(401,"You are not an eligible user for this operation !"));
    } else if ( req.userData.statusConfirmed == false ) {
        return next(createError(401, "Your account is not verified yet !"))
    }

    try{
        // Build user options
        if(req.userData.role == 'seller'){
            options = {
                org: "ecom",
                user: req.userData.id.toString(),
                method: "SetAccountBalance",
                args: [req.userData.id.toString(), req.body.depositAmount.toString()]
            };
        } else if (req.userData.role == 'logistic'){
            options = {
                org: "delivery",
                user: "admin",
                method: "SetAccountBalance",
                args: [req.userData.id.toString(), req.body.depositAmount.toString()]
            };
        }

        //  Perform set wallet balance
        let result = await contract.invoke(options);

        // Returnng success response
        await res.status(result.status).json({
            status: result.status,
            message: "Balance deposited successfully !",
            metaData: {
                token: 'ecomtoken',
                admin: result.txn._admin,
                depositAmount: req.body.depositAmount,
                txnId: result.txn._transaction_id
            }
        });

    } catch (error) {
        // If any error occur, then return error response
        next(createError(500, "Balance deposit failed !"));
    }
}

// get/check account balance
exports.getWalletBalance = async function (req, res, next) {

    let options = {};

    // Checking user eligibility
    if ( req.userData.role != 'seller' && req.userData.role != 'logistic'){
        return  next(createError(401,"You are not an eligible user for this operation !"));
    } else if ( req.userData.statusConfirmed == false ) {
        return next(createError(401, "Your account is not verified yet !"))
    }

    try{
        // Build user options
        if(req.userData.role == 'seller'){
            options = {
                org: "ecom",
                user: req.userData.id.toString(),
                method: "BalanceOf",
                args: [req.userData.id.toString()]
            };
        } else if (req.userData.role == 'logistic'){
            options = {
                org: "delivery",
                user: "admin",
                method: "BalanceOf",
                args: [req.userData.id.toString()]
            };
        }

        //  Getting wallet balance
        let result = await contract.query(options);

        // Returnng saved balance
        await res.status(result.status).json({
            status: result.status,
            walletBalance: parseFloat(result.data),
            message: "Wallet balance of the user",
        });

    } catch (error) {
        // If any error occur, then return error response
        next(createError(500, "Failed to get wallet balance !"));
    }
}