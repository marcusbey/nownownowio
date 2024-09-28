import rateLimit from 'express-rate-limit';
import { NextApiRequest, NextApiResponse } from 'next';

const apiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const rateLimitMiddleware = (req: NextApiRequest, res: NextApiResponse, next: any) => {
    return new Promise((resolve, reject) => {
        apiRateLimit(req as any, res as any, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};

export function runRateLimit(req: NextApiRequest, res: NextApiResponse) {
    return rateLimitMiddleware(req, res, () => { });
}