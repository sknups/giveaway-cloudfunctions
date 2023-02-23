import { AppError, GIVEAWAY_NOT_FOUND } from '../app.errors';
import { GiveawayEntity } from '../entity/giveaway.entity';
import { createContext, DatastoreContext, getEntity } from '../helpers/datastore/datastore.helper';
import logger from '../helpers/logger';

export class GiveawayRepository {

    public static context = createContext('claim');

    public async byCode(giveawayCode: string, context?: DatastoreContext): Promise<GiveawayEntity | null> {
        logger.debug(`byCode - giveawayCode = ${giveawayCode}`)

        const giveaway: GiveawayEntity = await getEntity('giveaway', giveawayCode);

        return giveaway;
    }

}
