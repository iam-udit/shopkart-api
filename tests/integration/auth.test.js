const request = require('supertest');
const app = require('../../app'); // Path to your Express app
const mongoose = require('mongoose');
const User = require('../../api/models/user'); // Path to your User model
const Seller = require('../../api/models/seller'); // Path to Seller model for cleanup if used

// Ensure this path is correct for your .env file setup for tests
// It's often good to have a specific .env.test or manage test env vars separately
require('dotenv').config({ path: 'config/process.env' });


describe('Authentication Endpoints', () => {
    // Connect to MongoDB before running any tests
    beforeAll(async () => {
        // Use a separate test database or ensure cleanup
        const mongoUri = process.env.DB_URI_TEST || process.env.DB_URI; // Use a test DB URI if available
        if (!mongoUri) {
            throw new Error('Test Database URI not found. Set DB_URI_TEST or DB_URI in your .env file.');
        }
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true, // useCreateIndex is not supported
        });
    });

    // Clear the User and Seller collections after each test
    afterEach(async () => {
        await User.deleteMany({});
        await Seller.deleteMany({}); // If sellers are created for auth tests or related tests
    });

    // Disconnect from MongoDB after all tests are done
    afterAll(async () => {
        await mongoose.connection.close();
    });

    // --- User Registration (/users/signup) ---
    describe('POST /users/signup', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/users/signup')
                .send({
                    mobileNumber: '1234567890',
                    password: 'password123',
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'User Created Successfully.');
            
            // Verify user is in the database (optional, but good for sanity check)
            const user = await User.findOne({ mobileNumber: '1234567890' });
            expect(user).not.toBeNull();
        });

        it('should fail registration with missing mobile number', async () => {
            const res = await request(app)
                .post('/users/signup')
                .send({
                    password: 'password123',
                });
            expect(res.statusCode).toBeGreaterThanOrEqual(400); // Or specific code if known e.g. 400/422
            // Add more specific error message checks if your API returns them
        });
        
        it('should fail registration with missing password', async () => {
            const res = await request(app)
                .post('/users/signup')
                .send({
                    mobileNumber: '1234567891',
                });
            expect(res.statusCode).toBeGreaterThanOrEqual(400);
        });

        it('should fail registration if mobile number already exists', async () => {
            // First, register a user
            await request(app)
                .post('/users/signup')
                .send({
                    mobileNumber: '1234567890',
                    password: 'password123',
                });
            
            // Attempt to register the same user again
            const res = await request(app)
                .post('/users/signup')
                .send({
                    mobileNumber: '1234567890',
                    password: 'password123',
                });
            expect(res.statusCode).toEqual(409); // Assuming 409 Conflict for existing user
            expect(res.body).toHaveProperty('message', 'User is already exists !');
        });
    });

    // --- User Login (/users/login) ---
    describe('POST /users/login', () => {
        beforeEach(async () => {
            // Register a user to be used for login tests
            // The password 'password123' will be hashed by the digestPassword middleware
            // before being passed to the userSignUp controller.
            // So, the userSignUp controller will save the hashed password.
            const signupRes = await request(app)
                .post('/users/signup')
                .send({
                    mobileNumber: '0987654321',
                    password: 'passwordLogin', // Plain password for signup
                });
            expect(signupRes.statusCode).toEqual(201); // Ensure user is created
        });

        it('should login an existing user successfully', async () => {
            const res = await request(app)
                .post('/users/login')
                .send({
                    mobileNumber: '0987654321',
                    password: 'passwordLogin', // Plain password for login
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Authentication sucesss !');
            expect(res.body).toHaveProperty('token');
        });

        it('should fail login with incorrect password', async () => {
            const res = await request(app)
                .post('/users/login')
                .send({
                    mobileNumber: '0987654321',
                    password: 'wrongPassword',
                });
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'User credential mismatched !');
        });

        it('should fail login for a non-existent mobile number', async () => {
            const res = await request(app)
                .post('/users/login')
                .send({
                    mobileNumber: '0000000000',
                    password: 'anyPassword',
                });
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'User credential mismatched !');
        });
    });
});
