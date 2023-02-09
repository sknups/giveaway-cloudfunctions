import { Request } from '@google-cloud/functions-framework';
import { Response } from 'express';
import { AllConfig } from '../config/all-config';
import { AppError, logAppError, UNCATEGORIZED_ERROR } from '../app.errors';
import { ValidationError } from './validation';
import { StatusCodes } from 'http-status-codes';

export async function functionWrapper(
    func: (req: Request, res: Response, cfg: AllConfig) => Promise<void>,
    req: Request,
    res: Response,
    config : Promise<AllConfig>,
) {
    try {
        const cfg: AllConfig = await config;
        await func(req, res, cfg);
    } catch (e) {
        if (e instanceof ValidationError) {
            res.status(StatusCodes.BAD_REQUEST).json({
                statusCode: StatusCodes.BAD_REQUEST,
                message: e.errorMessages,
            });
        } else {
            const appError: AppError = e instanceof AppError ? e : new AppError(UNCATEGORIZED_ERROR, e);
            logAppError(appError);
            res.status(appError.reason.statusCode).json(appError.reason);
        }
    }
}
