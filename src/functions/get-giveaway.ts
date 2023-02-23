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
import { parsePath } from '../helpers/util';
import { GiveawayState } from '../dto/giveaway-state.dto';

export class GetGiveaway {

    public static repository = new GiveawayRepository();

    public static async handler(req: Request, res: Response, config: AllConfig): Promise<void> {
        if (req.method != 'GET') {
            res.status(StatusCodes.METHOD_NOT_ALLOWED).send(`${req.method} not allowed`);
            return;
        }

        const pathParams = parsePath(req, res);

        if (!pathParams) {
            return;
        }

        logger.debug(`Received request for giveaway-get ${pathParams.key}`);
        const entity: GiveawayEntity = await GetGiveaway.repository.byCode(pathParams.key);

        if (entity === null) {
            logger.debug(`giveaway with code ${pathParams.key} not found`);
            throw new AppError(GIVEAWAY_NOT_FOUND(pathParams.key));
        }

        if (pathParams.retailer && entity.state === GiveawayState.SUSPENDED) {
            logger.debug(`giveaway with code ${pathParams.key} is suspended`);
            throw new AppError(GIVEAWAY_NOT_FOUND(pathParams.key));
        }

        const mapper = pathParams.retailer ? new RetailerGiveawayMapper(config.flexUrl) : new InternalGiveawayMapper();

        const giveaway: GiveawayDto = await mapper.entityToDto(entity);

        res.status(StatusCodes.OK).json(giveaway);
    }
}
