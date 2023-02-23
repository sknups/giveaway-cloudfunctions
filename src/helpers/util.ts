import { Request } from '@google-cloud/functions-framework';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export type GiveawayPathParams = {
    key: string;
    retailer: boolean;
}

export function parsePath(req: Request, res: Response): GiveawayPathParams | null {
    const parts = req.path
        .split('/')
        .filter((part: string) => !!part);

    const retailer: boolean = parts.includes('retailer');

    if ((!retailer && parts.length < 1) || (retailer && parts.length < 2)) {
        res.status(StatusCodes.BAD_REQUEST).send('giveaway code must be provided in path');
        return null;
    }

    const key = parts[parts.length - 1];

    return { key, retailer };
}

export function isRetailerRequest(req: Request): boolean {
    const parts = req.path.split('/');
    return parts.includes('retailer');
}
