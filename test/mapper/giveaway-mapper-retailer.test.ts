import "reflect-metadata";
import { RetailerGiveawayMapper } from '../../src/mapper/retailer/retailer-giveaway-mapper';
import { TEST_ENTITIES } from '../test-data-entities';
import { TEST_DTOS } from '../test-data-dtos';

describe('mapper - giveaway - retailer', () => {

    const instance = new RetailerGiveawayMapper('https://flex-dev.sknups.com');

    it('creates giveaway dto structure - v2', () => {
        expect(instance.toDto(TEST_ENTITIES.v2)).toEqual(TEST_DTOS.v2.retailer)
    });

});
