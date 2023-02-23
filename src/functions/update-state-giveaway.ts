import { Request } from '@google-cloud/functions-framework';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../helpers/logger';
import { AppError, NOT_AVAILABLE_TO_RETAILER } from '../app.errors';
import { InternalGiveawayMapper } from '../mapper/internal/internal-giveaway-mapper';
import { GiveawayEntity } from '../entity/giveaway.entity';
import { parsePath } from '../helpers/util';
import { parseAndValidateRequestData } from '../helpers/validation';
import { SetGiveawayStateRequestDto } from '../dto/set-giveaway-state-request.dto';
import { createContext, getEntity, updateEntity } from '../helpers/datastore/datastore.helper';

import { isRetailerRequest } from '../helpers/util';

export class UpdateStateGiveaway {

    public static repository = createContext('claim');

    public static async handler(req: Request, res: Response): Promise<void> {
        if (req.method != 'POST') {
            res.status(StatusCodes.METHOD_NOT_ALLOWED).send(`${req.method} not allowed`);
            return;
        }

        if (isRetailerRequest(req)) {
            throw new AppError(NOT_AVAILABLE_TO_RETAILER);
        }

        const pathParams = parsePath(req, res);

        if (!pathParams) {
            return;
        }

        const requestDto: SetGiveawayStateRequestDto = await parseAndValidateRequestData(SetGiveawayStateRequestDto, req);

        logger.debug(`Received request for giveaway-set-state ${pathParams.key}`);
        const giveaway: GiveawayEntity = await getEntity('giveaway', pathParams.key);

        giveaway.state = requestDto.state;

        await updateEntity('giveaway', giveaway);

        const mapper = new InternalGiveawayMapper();
        const response = await mapper.entityToDto(giveaway);

        res.status(StatusCodes.OK).json(response);
    }
}
