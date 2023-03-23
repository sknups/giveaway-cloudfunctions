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

export const LIMIT_REACHED = (limit: number, giveaway: string, dropLinkIdentifier: string): ErrorReason => {
    return {
        code: 'GIVEAWAY_00501',
        message: `Claim limit ${limit} reached for giveaway ${giveaway} and drop link id ${dropLinkIdentifier}`,
        statusCode: StatusCodes.FORBIDDEN,
    }
}

export const LUCU_DECODE_ERROR = (message: string): ErrorReason => {
    return {
        code: 'GIVEAWAY_00502',
        message: `An error occurred decoding the supplied lucu: ${message}`,
        statusCode: StatusCodes.BAD_REQUEST, // Most likely the client sent a bad lucu, rather than some internal server fault, so status 4xx
    }
}

export const ALL_SKUS_OUT_OF_STOCK = (giveaway: string): ErrorReason => {
    return {
        code: 'GIVEAWAY_00503',
        message: `All SKUs for giveaway ${giveaway} are out of stock`,
        statusCode: StatusCodes.FORBIDDEN,
    }
}

export const ITEM_MANUFACTURE_ERROR = (giveaway: string, sku: string): ErrorReason => {
    return {
        code: 'GIVEAWAY_00504',
        message: `Failed to manufacture an item for giveaway ${giveaway} with SKU ${sku}`,
        statusCode: StatusCodes.FORBIDDEN,
    }
}

export const V1_NOT_SUPPORTED = (giveaway: string): ErrorReason => {
    return {
        code: 'GIVEAWAY_00505',
        message: `Claim v1 using lucu not supported for giveaway ${giveaway}`,
        statusCode: StatusCodes.FORBIDDEN,
    }
}

export const V2_NOT_SUPPORTED = (giveaway: string): ErrorReason => {
    return {
        code: 'GIVEAWAY_00506',
        message: `Claim v2 using claim code not supported for giveaway ${giveaway}`,
        statusCode: StatusCodes.FORBIDDEN,
    }
}

export const CLAIM_CODE_DECODE_ERROR = (claim: string, message: string): ErrorReason => {
    return {
        code: 'GIVEAWAY_00507',
        message: `An error occurred decoding the supplied claim code ${claim} error message: ${message}`,
        statusCode: StatusCodes.BAD_REQUEST, // Most likely the client sent a bad code, rather than some internal server fault, so status 4xx
    }
}
