import { ClaimEntity } from '../entity/giveaway.entity';
import { countEntities, createContext, findEntities } from '../helpers/datastore/datastore.helper';
import logger from '../helpers/logger';

export class ClaimRepository {

    public static context = createContext('claim');

    public async findExisting(dropLinkIdentifier: string, giveawayCode: string, user: string  ): Promise<ClaimEntity | null> {
        logger.debug(`findExisting - dropLinkIdentifier = ${dropLinkIdentifier} giveawayCode = ${giveawayCode} user= ${user}`)

        const results : ClaimEntity[] = await findEntities(
            'claim',
            [
              { name: 'dropLinkIdentifier', op: '=', val: dropLinkIdentifier },
              { name: 'giveawayCode', op: '=', val: giveawayCode },
              { name: 'user', op: '=', val: user },
            ],
          );

        return results.length > 0 ? results[0]: null;
    }

    public async count(dropLinkIdentifier: string, giveawayCode: string ): Promise<number> {
        logger.debug(`count - dropLinkIdentifier = ${dropLinkIdentifier} giveawayCode = ${giveawayCode}`)

        return await countEntities(
            'claim',
            [
              { name: 'dropLinkIdentifier', op: '=', val: dropLinkIdentifier },
              { name: 'giveawayCode', op: '=', val: giveawayCode },
            ],
        );
    }
}


