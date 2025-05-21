const utils = require('../../../api/middlewares/utils'); // Adjust path as needed
const mongoose = require('mongoose'); // buildOrderQuery uses mongoose.Types.ObjectId

describe('buildOrderQuery', () => {
    let mockReq;

    beforeEach(() => {
        // Reset mockReq before each test
        mockReq = {
            originalUrl: '',
            userData: { id: 'testUserId', role: 'customer' }, // Default user data
            params: {}, // For route params like /:status or /:productId
        };
    });

    it('should build a query for a user if path is by-user', () => {
        mockReq.originalUrl = '/orders/by-user';
        const query = utils.buildOrderQuery(mockReq);
        expect(query).toEqual({ user: 'testUserId' });
    });

    it('should build a query for a seller with default status if path is by-seller and no status param', () => {
        mockReq.originalUrl = '/orders/by-seller';
        mockReq.userData.role = 'seller'; // Assume seller role for this path
        // req.params.status would be undefined here if not explicitly set in path
        const query = utils.buildOrderQuery(mockReq);
        expect(query).toEqual({
            seller: 'testUserId',
            orderStatus: 'Pending',
        });
    });

    it('should build a query for a seller with specified status if path is by-seller/:status', () => {
        mockReq.originalUrl = '/orders/by-seller/Shipped';
        mockReq.userData.role = 'seller';
        // mockReq.params.status = 'Shipped'; // This would typically be set by Express routing
        // The function extracts status from originalUrl, so this is how it gets it:
        // pathSegments[3] will be 'Shipped'
        const query = utils.buildOrderQuery(mockReq);
        expect(query).toEqual({
            seller: 'testUserId',
            orderStatus: 'Shipped',
        });
    });

    it('should build a query for a logistic with specified status', () => {
        mockReq.originalUrl = '/orders/by-logistic/Confirmed';
        mockReq.userData.role = 'logistic';
        // mockReq.params.status = 'Confirmed';
        const query = utils.buildOrderQuery(mockReq);
        expect(query).toEqual({
            logistic: 'testUserId',
            orderStatus: 'Confirmed',
        });
    });

    it('should build a query for a courier with specified status', () => {
        mockReq.originalUrl = '/orders/by-courier/Delivered';
        mockReq.userData.role = 'courier';
        // mockReq.params.status = 'Delivered';
        const query = utils.buildOrderQuery(mockReq);
        expect(query).toEqual({
            courier: 'testUserId',
            orderStatus: 'Delivered',
        });
    });

    it('should build a query for a product if path is by-product/:productId', () => {
        const productId = new mongoose.Types.ObjectId().toString();
        mockReq.originalUrl = `/orders/by-product/${productId}`;
        // mockReq.params.productId = productId;
        const query = utils.buildOrderQuery(mockReq);
        expect(query).toEqual({ product: productId });
    });

    it('should return an empty query if path is not recognized (e.g. get-all or default)', () => {
        mockReq.originalUrl = '/orders/get-all';
        const query = utils.buildOrderQuery(mockReq);
        expect(query).toEqual({});
    });
    
    it('should return an empty query for default case if path is unrecognized', () => {
        mockReq.originalUrl = '/orders/some-other-path';
        const query = utils.buildOrderQuery(mockReq);
        expect(query).toEqual({});
    });
});

// Placeholder for other utils functions if any - for now, focusing on buildOrderQuery
// describe('otherUtilFunction', () => { ... });
