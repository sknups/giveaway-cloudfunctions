import { Request } from '@google-cloud/functions-framework';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../helpers/logger';
import { AppError, ENTITY_NOT_FOUND, NOT_AVAILABLE_TO_RETAILER } from '../app.errors';
import { InternalGiveawayMapper } from '../mapper/internal/internal-giveaway-mapper';
import { GiveawayEntity } from '../entity/giveaway.entity';
import { parseAndValidateRequestData } from '../helpers/validation';
import { SetGiveawayStateRequestDto } from '../dto/set-giveaway-state-request.dto';
import { createContext, getEntity, startTransaction, updateEntity } from '../helpers/datastore/datastore.helper';

import { isRetailerRequest, getCodeFromPathWithOptionalSubResource } from '../helpers/url';

export class UpdateStateGiveaway {

    public static repository = createContext('claim');

    public static mapper =  new InternalGiveawayMapper();

    public static async handler(req: Request, res: Response): Promise<void> {

        const kind = UpdateStateGiveaway.mapper.entityKind();
        const excludeFromIndexes = UpdateStateGiveaway.mapper.excludeFromIndexes();

        //POST is deprecated 
        if (req.method != 'PUT' && req.method != 'POST' ) {
            res.status(StatusCodes.METHOD_NOT_ALLOWED).send(`${req.method} not allowed`);
            return;
        }
        
        if (req.method == 'POST' ) {
          logger.warn('POST support is now deprecated')
        }

        if (isRetailerRequest(req)) {
            throw new AppError(NOT_AVAILABLE_TO_RETAILER);
        }

        const code = getCodeFromPathWithOptionalSubResource(kind,"state",req);

        const requestDto: SetGiveawayStateRequestDto = await parseAndValidateRequestData(SetGiveawayStateRequestDto, req);

        logger.debug(`Received request for giveaway-set-state ${code}`);
        const giveaway: GiveawayEntity | null = await getEntity(kind, code);
        if (!giveaway) {
            throw new AppError(ENTITY_NOT_FOUND(kind, code));
          }

        giveaway.state = requestDto.state;

        const tx = await startTransaction();

        await updateEntity(kind, giveaway, tx, excludeFromIndexes);

        const response = await UpdateStateGiveaway.mapper.entityToDto(giveaway);

        res.status(StatusCodes.OK).json(response);
    }
}
