const request = require('supertest');
const app = require('../../app'); // Path to your Express app
const mongoose = require('mongoose');
const Product = require('../../api/models/product'); // Path to your Product model
const Seller = require('../../api/models/seller'); // For creating a seller if needed for products

// Ensure this path is correct for your .env file setup for tests
require('dotenv').config({ path: 'config/process.env' });

describe('Product GET Endpoints (Non-Fabric)', () => {
    let seller;
    let product1, product2;

    beforeAll(async () => {
        const mongoUri = process.env.DB_URI_TEST || process.env.DB_URI;
        if (!mongoUri) {
            throw new Error('Test Database URI not found.');
        }
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Create a seller for the products
        seller = new Seller({
            _id: new mongoose.Types.ObjectId(),
            firstName: 'Test',
            lastName: 'Seller',
            email: 'testseller@example.com',
            password: 'password123', // Will be hashed by model's pre-save
            statusConfirmed: true,
        });
        await seller.save();
    });

    beforeEach(async () => {
        // Create some products before each test in this suite
        product1 = await new Product({
            _id: new mongoose.Types.ObjectId(),
            title: 'Test Product 1',
            type: 'Electronics',
            seller: seller._id,
            price: 100,
            quantity: 10,
            description: 'Description for product 1',
            productImages: ['img1.jpg'],
        }).save();

        product2 = await new Product({
            _id: new mongoose.Types.ObjectId(),
            title: 'Test Product 2',
            type: 'Books',
            seller: seller._id,
            price: 25,
            quantity: 5,
            description: 'Description for product 2',
            productImages: ['img2.jpg'],
        }).save();
    });

    afterEach(async () => {
        await Product.deleteMany({});
    });

    afterAll(async () => {
        await Seller.deleteMany({});
        await mongoose.connection.close();
    });

    // --- GET All Products (/products/get-all) ---
    describe('GET /products/get-all', () => {
        it('should retrieve a list of products', async () => {
            const res = await request(app).get('/products/get-all');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('products');
            expect(res.body.products.length).toBeGreaterThanOrEqual(2); // Based on beforeEach
        });
    });

    // --- GET Product by ID (/products/get/:productId) ---
    describe('GET /products/get/:productId', () => {
        it('should retrieve a specific product by its ID', async () => {
            const res = await request(app).get(`/products/get/${product1._id}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('product');
            expect(res.body.product._id).toEqual(product1._id.toString());
            expect(res.body.product.title).toEqual('Test Product 1');
        });

        it('should return 404 if product ID does not exist', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/products/get/${nonExistentId}`);
            // The controller returns product as an array from aggregate, empty array is not a 404 here.
            // It will return 200 with an empty product array or specific message.
            // The actual controller logic for getProduct (aggregate) returns 404 if product.length === 0
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'No valid entry found for provided input');
        });
    });

    // --- GET Product by Type (/products/by-type/:productType) ---
    describe('GET /products/by-type/:productType', () => {
        it('should retrieve products of a specific type', async () => {
            const res = await request(app).get('/products/by-type/Electronics');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('products');
            expect(res.body.products.length).toBeGreaterThanOrEqual(1);
            expect(res.body.products.every(p => p.type === 'Electronics')).toBe(true);
        });

        it('should return 404 if no products of a specific type are found', async () => {
            const res = await request(app).get('/products/by-type/NonExistentType');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'Product not found !');
        });
    });
    
    // --- GET Product by Title (/products/by-title/:productTitle) ---
    // Note: This endpoint groups by title and returns details of the first one found along with a sellerList.
    describe('GET /products/by-title/:productTitle', () => {
        it('should retrieve product details and seller list by product title', async () => {
            const res = await request(app).get('/products/by-title/Test Product 1');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('product');
            expect(res.body.product.title).toEqual('Test Product 1');
            expect(res.body).toHaveProperty('sellerList');
            expect(res.body.sellerList.length).toBeGreaterThanOrEqual(1);
        });

        it('should return 404 if no product with the specified title is found', async () => {
            const res = await request(app).get('/products/by-title/NonExistentProductTitle');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'No valid entry found for provided input');
        });
    });
});
