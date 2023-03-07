import { Request } from '@google-cloud/functions-framework';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../helpers/logger';
import { GiveawayRepository } from '../persistence/giveaway-repository';
import { AppError, GIVEAWAY_NOT_FOUND } from '../app.errors';
import { RetailerGiveawayMapper } from '../mapper/retailer/retailer-giveaway-mapper';
import { InternalGiveawayMapper } from '../mapper/internal/internal-giveaway-mapper';
import { AllConfig } from 'config/all-config';
import { GiveawayDto } from '../dto/giveaway.dto';
import { GiveawayEntity } from '../entity/giveaway.entity';
import { GiveawayState } from '../dto/giveaway-state.dto';
import { isRetailerRequest, getCodeFromPath } from '../helpers/url';

export class GetGiveaway {

    public static repository = new GiveawayRepository();

    public static async handler(req: Request, res: Response, config: AllConfig): Promise<void> {
        if (req.method != 'GET') {
            res.status(StatusCodes.METHOD_NOT_ALLOWED).send(`${req.method} not allowed`);
            return;
        }

        const code = getCodeFromPath('giveaway',req);
        const retailer = isRetailerRequest(req);


        logger.debug(`Received request for giveaway-get ${code}`);
        const entity: GiveawayEntity | null = await GetGiveaway.repository.byCode(code);

        if (entity === null) {
            logger.debug(`giveaway with code ${code} not found`);
            throw new AppError(GIVEAWAY_NOT_FOUND(code));
        }

        if (retailer && entity.state === GiveawayState.SUSPENDED) {
            logger.debug(`giveaway with code ${code} is suspended`);
            throw new AppError(GIVEAWAY_NOT_FOUND(code));
        }

        const mapper = retailer ? new RetailerGiveawayMapper(config.flexUrl) : new InternalGiveawayMapper();

        const giveaway: GiveawayDto = await mapper.entityToDto(entity);

        res.status(StatusCodes.OK).json(giveaway);
    }
}
