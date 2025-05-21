// Importing all required files
const createError = require('http-errors');
const contract = require('../sdk/gateway/contract');

// Initializing EcomToken for the Organization
exports.initEcomToken = async function (req, res, next) {
    // Getting totalSupply from request
    let totalSupply = req.body.totalSupply;

    try {
        let options = {
            org: 'ecom',
            user: 'admin',
            method: 'CreateToken',
            args: [totalSupply.toString()],
        };
        //  Generating ecom-token
        let result = await contract.invoke(options);

        // Returnng success response
        return res.status(result.status).json({
            // Added return
            status: result.status,
            message: 'Token created successfully',
            metaData: {
                token: 'ecomtoken',
                admin: result.txn._admin,
                totalSupply: totalSupply,
                txnId: result.txn._transaction_id,
            },
        });
    } catch {
        // Removed unused _e
        return next(createError(500, 'Failed to initalize token !')); // Added return
    }
};

// Adding EcomToken for the Organization
exports.addEcomToken = async function (req, res, next) {
    // Getting tokenAmount from request
    let tokenAmount = req.body.tokenAmount;

    try {
        let options = {
            org: 'ecom',
            user: 'admin',
            method: 'AddToken',
            args: [tokenAmount.toString()],
        };
        //  Adding ecom-token
        let result = await contract.invoke(options);

        // Returnng success response
        return res.status(result.status).json({
            // Added return
            status: result.status,
            message: 'Token added successfully',
            metaData: {
                token: 'ecomtoken',
                admin: result.txn._admin,
                tokenAmount: tokenAmount,
                txnId: result.txn._transaction_id,
            },
        });
    } catch (error) {
        if (error.message) {
            return next(createError(404, "Token doesn't exists !")); // Added return
        } else {
            return next(createError(500, 'Failed to add token !')); // Added return
        }
    }
};

// Checking total token supplied
exports.getTotalSupply = async function (req, res, next) {
    try {
        let options = {
            org: 'ecom',
            user: 'admin',
            method: 'TotalSupply',
            args: [],
        };

        //  Getting totalSupply
        let result = await contract.query(options);

        // Returnng totalSupply
        return res.status(result.status).json({
            // Added return
            status: result.status,
            totalSupply: parseFloat(result.data),
            message: 'Total token supplied details',
        });
    } catch (error) {
        if (error.message) {
            return next(createError(404, "Token doesn't exists !")); // Added return
        } else {
            return next(createError(500, 'Failed to get total supply !')); // Added return
        }
    }
};

// Checking token supply availability
exports.getAvailableSupply = async function (req, res, next) {
    try {
        let options = {
            org: 'ecom',
            user: 'admin',
            method: 'AvailableSupply',
            args: [],
        };

        //  Getting available supply
        let result = await contract.query(options);

        // Returnng availableSupply
        return res.status(result.status).json({
            // Added return
            status: result.status,
            availableSupply: parseFloat(result.data),
            message: 'Available token supply details',
        });
    } catch (error) {
        if (error.message) {
            return next(createError(404, "Token doesn't exists !")); // Added return
        } else {
            return next(createError(500, 'Failed to get available supply !')); // Added return
        }
    }
};

// set wallet balance/ purchase token
exports.setWalletBalance = async function (req, res, next) {
    let options = {};

    // Checking user eligibility
    if (req.userData.role !== 'seller' && req.userData.role !== 'logistic') {
        return next(
            // ESLint: consistent-return
            createError(
                401,
                'You are not an eligible user for this operation !'
            )
        );
    } else if (req.userData.statusConfirmed === false) {
        return next(createError(401, 'Your account is not verified yet !')); // ESLint: consistent-return
    }

    try {
        // Build user options
        if (req.userData.role === 'seller') {
            options = {
                org: 'ecom',
                user: req.userData.id.toString(),
                method: 'SetAccountBalance',
                args: [
                    req.userData.id.toString(),
                    req.body.depositAmount.toString(),
                ],
            };
        } else if (req.userData.role === 'logistic') {
            options = {
                org: 'delivery',
                user: 'admin',
                method: 'SetAccountBalance',
                args: [
                    req.userData.id.toString(),
                    req.body.depositAmount.toString(),
                ],
            };
        }

        //  Perform set wallet balance
        let result = await contract.invoke(options);

        // Returnng success response
        return res.status(result.status).json({
            // Added return
            status: result.status,
            message: 'Balance deposited successfully !',
            metaData: {
                token: 'ecomtoken',
                admin: result.txn._admin,
                depositAmount: req.body.depositAmount,
                txnId: result.txn._transaction_id,
            },
        });
    } catch {
        // Removed unused _error
        // ESLint: no-unused-vars (error variable is not used in createError message)
        // If any error occur, then return error response
        return next(createError(500, 'Balance deposit failed !')); // Added return
    }
};

// get/check account balance
exports.getWalletBalance = async function (req, res, next) {
    let options = {};

    // Checking user eligibility
    if (req.userData.role !== 'seller' && req.userData.role !== 'logistic') {
        return next(
            // ESLint: consistent-return
            createError(
                401,
                'You are not an eligible user for this operation !'
            )
        );
    } else if (req.userData.statusConfirmed === false) {
        return next(createError(401, 'Your account is not verified yet !')); // ESLint: consistent-return
    }

    try {
        // Build user options
        if (req.userData.role === 'seller') {
            options = {
                org: 'ecom',
                user: req.userData.id.toString(),
                method: 'BalanceOf',
                args: [req.userData.id.toString()],
            };
        } else if (req.userData.role === 'logistic') {
            options = {
                org: 'delivery',
                user: 'admin',
                method: 'BalanceOf',
                args: [req.userData.id.toString()],
            };
        }

        //  Getting wallet balance
        let result = await contract.query(options);

        // Returnng saved balance
        return res.status(result.status).json({
            // Added return
            status: result.status,
            walletBalance: parseFloat(result.data),
            message: 'Wallet balance of the user',
        });
    } catch (error) {
        // If any error occur, then return error response
        return next(createError(500, 'Failed to get wallet balance !')); // Added return
    }
};

// Update account status
exports.verifyAccount = async function (req, res, next) {
    // Getting the model
    var temp = req.originalUrl.split('/')[1];
    // Making model class
    var Model = require('../models/' + temp.substring(0, temp.length - 1));

    try {
        // Confirm account status
        const result = await Model.updateOne(
            { _id: req.params.id },
            { $set: { statusConfirmed: true } }
        ).exec();

        // If confirmation successful, return success response
        // nModified is part of the WriteResult object for older Mongoose versions.
        // For Mongoose v5+, updateOne().exec() returns an object like { n, nModified, ok }
        // For Mongoose v6+, it's { acknowledged, matchedCount, modifiedCount, upsertedCount, upsertedId }
        // Assuming a relatively modern Mongoose (v5+), we'll check modifiedCount or nModified.
        // Given the project's age, nModified is more likely.
        if (result.nModified > 0 || result.modifiedCount > 0) {
            return res.status(200).json({
                // Added return
                status: 200,
                message: 'Account Verified !',
            });
        }
        // If invalid user id or no document was modified
        else {
            // Check if the document was found but not modified (already verified)
            // For simplicity, we'll treat not modified as "user not found or not needing update"
            // A more specific check would involve a preliminary findOne if necessary.
            return next(
                // Added return
                createError(404, 'Invalid user Id or account already verified!')
            );
        }
    } catch (error) {
        // error.message and error.status are used. The eslint-disable was found to be unused.
        // If verification failed.
        // Create a new error object to avoid modifying the original error from the catch block directly.
        const newError = new Error(
            'Verification failed ! due to: ' + error.message
        );
        newError.status = error.status || 500; // Preserve original status if available
        return next(newError); // Added return
    }
};
