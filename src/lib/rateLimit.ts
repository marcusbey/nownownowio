import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { NextApiRequest, NextApiResponse } from 'next';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});

export function runRateLimit(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    return new Promise((resolve, reject) => {
        limiter(
            req as unknown as Request,
            res as unknown as Response,
            ((error: unknown) => {
                if (error) {
                    return reject(error);
                }
                resolve();
            }) as NextFunction
        );
    });
}