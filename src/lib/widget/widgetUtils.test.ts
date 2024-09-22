import { generateApiKey, verifyApiKey } from './widgetUtils';

describe('widgetUtils', () => {
    beforeAll(() => {
        process.env.API_KEY_SECRET = 'test-secret';
    });

    describe('generateApiKey', () => {
        it('generates a valid API key', () => {
            const userId = 'testUser';
            const apiKey = generateApiKey({ userId });
            expect(apiKey).toBeTruthy();
            expect(apiKey.split('|').length).toBe(3);
        });

        it('generates different keys for different users', () => {
            const key1 = generateApiKey({ userId: 'user1' });
            const key2 = generateApiKey({ userId: 'user2' });
            expect(key1).not.toBe(key2);
        });
    });

    describe('verifyApiKey', () => {
        it('verifies a valid API key', () => {
            const userId = 'testUser';
            const apiKey = generateApiKey({ userId });
            const result = verifyApiKey(apiKey);
            expect(result.isValid).toBe(true);
            expect(result.userId).toBe(userId);
        });

        it('rejects an invalid API key', () => {
            const result = verifyApiKey('invalid|key|format');
            expect(result.isValid).toBe(false);
            expect(result.userId).toBeUndefined();
        });

        it('rejects an expired API key', () => {
            const userId = 'testUser';
            const apiKey = generateApiKey({ userId, expiresIn: -1 }); // Expired key
            const result = verifyApiKey(apiKey);
            expect(result.isValid).toBe(false);
        });
    });
});