const sanitizeMiddleware = require('../../../api/middlewares/sanitization'); // Adjust path as needed

describe('Sanitization Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
        mockReq = {
            body: {},
            query: {},
            params: {},
        };
        mockRes = {}; // Not used by this middleware
        nextFunction = jest.fn();
    });

    it('should sanitize req.body strings', () => {
        mockReq.body = {
            name: '<script>alert("xss")</script>John Doe',
            description: 'Test with <iframe>evil</iframe> content.',
        };
        sanitizeMiddleware(mockReq, mockRes, nextFunction);
        expect(mockReq.body.name).toBe('John Doe');
        expect(mockReq.body.description).toBe('Test with evil content.'); // Corrected expectation
        expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should sanitize req.query strings', () => {
        mockReq.query = {
            search: 'user<img src=x onerror=alert(1)>',
            filter: 'test&<>"\'',
        };
        sanitizeMiddleware(mockReq, mockRes, nextFunction);
        expect(mockReq.query.search).toBe('user');
        expect(mockReq.query.filter).toBe('test&amp;&lt;&gt;"\''); // Corrected expectation
        expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should sanitize req.params strings', () => {
        mockReq.params = {
            id: '123<script>window.location="http://evil.com"</script>',
            category: 'books<style>body{display:none}</style>',
        };
        sanitizeMiddleware(mockReq, mockRes, nextFunction);
        expect(mockReq.params.id).toBe('123');
        expect(mockReq.params.category).toBe('books');
        expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should recursively sanitize nested objects and arrays in req.body', () => {
        mockReq.body = {
            title: 'Safe Title',
            details: {
                info: '<b>Bold</b> but <script>dangerous</script>',
                tags: [
                    'safe',
                    '<img src=x onerror=alert("tag")>',
                    { nestedTag: 'very <blink>annoying</blink>' },
                ],
            },
            chapters: [{ name: 'Chapter 1 <script></script>' }, { name: 'Safe Chapter' }],
        };
        sanitizeMiddleware(mockReq, mockRes, nextFunction);
        expect(mockReq.body.details.info).toBe('Bold but '); // Corrected expectation (script content removed)
        expect(mockReq.body.details.tags[0]).toBe('safe');
        expect(mockReq.body.details.tags[1]).toBe(''); // img tag and content removed
        expect(mockReq.body.details.tags[2].nestedTag).toBe('very annoying'); // blink tag removed, content kept
        expect(mockReq.body.chapters[0].name).toBe('Chapter 1 '); // script tag and content removed
        expect(mockReq.body.chapters[1].name).toBe('Safe Chapter');
        expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should handle empty body, query, and params without error', () => {
        sanitizeMiddleware(mockReq, mockRes, nextFunction);
        expect(mockReq.body).toEqual({});
        expect(mockReq.query).toEqual({});
        expect(mockReq.params).toEqual({});
        expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should not alter non-string values', () => {
        mockReq.body = {
            count: 123,
            isActive: true,
            data: null,
            value: undefined, // sanitize-html might convert undefined in objects to empty strings or remove key
        };
        sanitizeMiddleware(mockReq, mockRes, nextFunction);
        expect(mockReq.body.count).toBe(123);
        expect(mockReq.body.isActive).toBe(true);
        expect(mockReq.body.data).toBeNull();
        // Depending on sanitize-html's behavior for undefined object properties,
        // this might be `expect(mockReq.body.value).toBeUndefined()` or it might be removed.
        // The current recursive function will keep it as undefined.
        expect(mockReq.body.value).toBeUndefined();
        expect(nextFunction).toHaveBeenCalledTimes(1);
    });
});
