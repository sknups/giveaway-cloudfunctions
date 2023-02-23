import { Request } from '@google-cloud/functions-framework';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError, NOT_AVAILABLE_TO_RETAILER } from '../app.errors';
import { InternalGiveawayMapper } from '../mapper/internal/internal-giveaway-mapper';
import { SaveGiveawayRequestDto } from '../dto/save-giveaway-request.dto';
import { saveInTransaction } from '../helpers/crud';
import { createContext } from '../helpers/datastore/datastore.helper';
import { isRetailerRequest } from '../helpers/util';

export class SaveGiveaway {

    public static repository = createContext('claim');

    public static async handler(req: Request, res: Response): Promise<void> {
        if (isRetailerRequest(req)) {
            throw new AppError(NOT_AVAILABLE_TO_RETAILER);
        }

        const mapper = new InternalGiveawayMapper();

        const response = await saveInTransaction(SaveGiveawayRequestDto, req, mapper);

        res.status(response.created ? StatusCodes.CREATED : StatusCodes.OK).json(response);
    }
}
