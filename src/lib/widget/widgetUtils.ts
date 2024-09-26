import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.WIDGET_SECRET_KEY!;


interface ApiKeyOptions {
    userId: string;
    expiresIn?: number; // in seconds
}

export function generateApiKey({ userId, expiresIn = 86400 }: ApiKeyOptions): string {
    const secret = process.env.API_KEY_SECRET;
    if (!secret) {
        throw new Error('API_KEY_SECRET is not defined');
    }
    const expirationTime = Math.floor(Date.now() / 1000) + expiresIn;
    const data = `${userId}|${expirationTime}`;
    const hmac = crypto.createHmac('sha256', secret);
    const signature = hmac.update(data).digest('hex');
    return `${data}|${signature}`;
}

export function verifyApiKey(apiKey: string): { isValid: boolean; userId?: string } {
    const secret = process.env.API_KEY_SECRET;
    if (!secret) {
        throw new Error('API_KEY_SECRET is not defined');
    }
    const [userId, expirationTime, signature] = apiKey.split('|');
    if (!userId || !expirationTime || !signature) {
        return { isValid: false };
    }
    const data = `${userId}|${expirationTime}`;
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(data).digest('hex');
    const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature)) &&
        parseInt(expirationTime, 10) > Math.floor(Date.now() / 1000);
    return { isValid, userId: isValid ? userId : undefined };
}

export function generateWidgetToken(userId: string): string {
    const secret = process.env.WIDGET_SECRET_KEY;
    if (!secret) {
        throw new Error('WIDGET_SECRET_KEY is not defined');
    }
    return jwt.sign({ userId }, secret, { expiresIn: '30d' });
}

export function verifyWidgetToken(token: string, userId: string): boolean {
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
        return decoded.userId === userId;
    } catch (error) {
        return false;
    }
}