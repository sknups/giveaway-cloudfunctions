import { Datastore } from '@google-cloud/datastore';
import { NamedKeyEntity } from '../../src/helpers/persistence/base.entity';
import { TEST_ENTITIES } from '../test-data-entities';
import { GiveawayRepository } from '../../src/persistence/giveaway-repository';

function _toDatastoreEntity(mappedEntity: NamedKeyEntity): any {
    const result: any = { ...mappedEntity };
    result[Datastore.KEY] = { name: mappedEntity.key };
    delete result.key;
    return result;
}

const QUERY_DATA = _toDatastoreEntity(TEST_ENTITIES.v2);

describe('persistence', () => {

    let getSpy;
    let instance: GiveawayRepository;

    beforeEach(function () {
        getSpy = jest.spyOn(Datastore.prototype, 'get');
        instance = new GiveawayRepository();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('byCode', () => {

        beforeEach(function () {
            getSpy.mockReturnValueOnce([QUERY_DATA] as any);
        });

        it('uses correct query', async () => {
            await instance.byCode(TEST_ENTITIES.v2.key);

            const expectedQuery = {
                namespace: 'claim',
                kind: 'giveaway',
                name: TEST_ENTITIES.v2.key,
            };

            expect(getSpy).toHaveBeenCalledTimes(1);
            expect(getSpy).toHaveBeenLastCalledWith(expect.objectContaining(expectedQuery));
        });

        it('transforms results', async () => {
            const result = await instance.byCode(TEST_ENTITIES.v2.key);

            expect(result).toEqual(TEST_ENTITIES.v2);
        });

        it('returns null for non ACTIVE state', async () => {
            getSpy.mockReset();
            getSpy.mockReturnValueOnce([{ ...QUERY_DATA, state: 'INACTIVE' }] as any);

            const result = await instance.byCode(TEST_ENTITIES.v2.key);

            expect(result).toEqual(null);
        });

    });


});
