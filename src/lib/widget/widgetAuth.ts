import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.WIDGET_SECRET_KEY!;

export function generateWidgetToken(userId: string): string {
    return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '30d' });
}

export function verifyWidgetToken(token: string, userId: string): boolean {
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
        return decoded.userId === userId;
    } catch (error) {
        return false;
    }
}