import { GiveawayEntity } from '../src/entity/giveaway.entity';

export const TEST_GIVEAWAY_KEY = '492f965d7bbadd4834002a81a73aa44c';

const TEST_GIVEAWAY: GiveawayEntity = {
    code: 'test-giveaway',
    config: '{"skuEntries":[{"code":"TEST-TETRAHEDRON-GIVEAWAY","weight":null}]}',
    description: 'Claim your free SKN now',
    publicKey: null,
    secret: TEST_GIVEAWAY_KEY,
    state: 'ACTIVE',
    title: 'SKNUPS Giveaway',
    type: 'SIMPLE',
}

export const TEST_ENTITIES = {
    giveaway: {
        'test-giveaway': TEST_GIVEAWAY,
        'invalid-secret-key': {
            ...TEST_GIVEAWAY,
            code: 'invalid-secret-key',
            secret: 'invalid',
        },
        'null-secret-key': {
            ...TEST_GIVEAWAY,
            code: 'null-secret-key',
            secret: null,
        },
        'inactive': {
            ...TEST_GIVEAWAY,
            code: 'inactive',
            state: 'INACTIVE',
        }
    }
}
