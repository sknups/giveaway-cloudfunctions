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


export const CODE_NOT_FOUND_IN_PATH = (kind: string): ErrorReason => {
    return {
        code: 'GIVEAWAY_00401',
        message: `${kind} code not found in path`,
        statusCode: StatusCodes.BAD_REQUEST,
    }
}

export const HTTP_METHOD_NOT_ALLOWED = (method: string): ErrorReason => {
    return {
        code: 'GIVEAWAY_00400',
        message: `${method} not allowed`,
        statusCode: StatusCodes.METHOD_NOT_ALLOWED,
    }
}

export const ENTITY_NOT_FOUND = (kind: string, code: string): ErrorReason => {
    return {
        code: 'GIVEAWAY_00300',
        message: `Can't find ${kind} with code '${code}'`,
        statusCode: StatusCodes.NOT_FOUND,
    }
}

export const NOT_AVAILABLE_TO_RETAILER: ErrorReason = {
    code: 'GIVEAWAY_00404',
    message: 'Not available to retailer',
    statusCode: StatusCodes.FORBIDDEN,
}