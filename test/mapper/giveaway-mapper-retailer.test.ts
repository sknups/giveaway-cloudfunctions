import "reflect-metadata";
import { RetailerGiveawayMapper } from '../../src/mapper/retailer/retailer-giveaway-mapper';
import { TEST_ENTITIES } from '../test-data-entities';
import { TEST_DTOS } from '../test-data-dtos';

describe('mapper - giveaway - retailer', () => {

    const instance = new RetailerGiveawayMapper('https://flex-dev.sknups.com');

    it('creates giveaway dto structure - v2', async () => {
        expect(await instance.entityToDto(TEST_ENTITIES.giveaway['test-giveaway'])).toEqual(TEST_DTOS.giveaway.retailer['test-giveaway'])
    });

});
