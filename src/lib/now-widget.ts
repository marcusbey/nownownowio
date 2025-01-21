import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from './env';

const SECRET_KEY = env.WIDGET_SECRET_KEY;

interface ApiKeyOptions {
    userId: string;
    expiresIn?: number; // in seconds
}

export function generateApiKey({ userId, expiresIn = 86400 }: ApiKeyOptions): string {
    const secret = env.API_KEY_SECRET;
    const expirationTime = Math.floor(Date.now() / 1000) + expiresIn;
    const data = `${userId}|${expirationTime}`;
    const hash = crypto.createHmac('sha256', secret).update(data).digest('hex');
    return `${data}|${hash}`;
}

export function verifyApiKey(apiKey: string): { isValid: boolean; userId?: string } {
    const secret = env.API_KEY_SECRET;
    try {
        const [userId, expirationTime, hash] = apiKey.split('|');
        const data = `${userId}|${expirationTime}`;
        const expectedHash = crypto.createHmac('sha256', secret).update(data).digest('hex');

        if (hash !== expectedHash) {
            return { isValid: false };
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > parseInt(expirationTime)) {
            return { isValid: false };
        }

        return { isValid: true, userId };
    } catch {
        return { isValid: false };
    }
}

export function generateWidgetToken(userId: string): string {
    return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '24h' });
}

export function verifyWidgetToken(token: string, userId: string): boolean {
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
        return decoded.userId === userId;
    } catch {
        return false;
    }
}