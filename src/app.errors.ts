import { StatusCodes } from 'http-status-codes';
import logger from './helpers/logger';

export type ErrorReason = {
    code: string;
    message: string;
    statusCode: number;
}

export class AppError extends Error {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(readonly reason: ErrorReason, cause?: any) {
        super(reason.message);
        const originalStackTrace = cause?.stack;
        if (originalStackTrace) {
            this.stack = `${this.stack}\nCaused by: ${originalStackTrace}`;
        }
    }
}

export function logAppError(error: AppError) {
    const logError: boolean = (logger.level == 'info' || logger.level == 'debug')
        || (error.reason.statusCode >= 500 && error.reason.statusCode < 600);
    if (logError) {
        logger.error(error);
    }
}

export function GIVEAWAY_NOT_FOUND(code: string): ErrorReason {
    return {
        code: 'GIVEAWAY_00001',
        message: `Giveaway with code ${code} not found`,
        statusCode: StatusCodes.NOT_FOUND,
    }
}

export const UNCATEGORIZED_ERROR: ErrorReason = {
    code: 'GIVEAWAY_00900',
    message: 'An uncategorized error has occurred',
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
}
