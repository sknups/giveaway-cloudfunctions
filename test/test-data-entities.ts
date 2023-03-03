import { GiveawayEntity } from '../src/entity/giveaway.entity';

export const TEST_GIVEAWAY_KEY = '492f965d7bbadd4834002a81a73aa44c';

const TEST_GIVEAWAY: GiveawayEntity = {
    code: 'test-giveaway',
    config: '{"skuEntries":[{"code":"TEST-TETRAHEDRON-GIVEAWAY","weight":null}]}',
    description: 'Claim your free SKN now',
    publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzooSe3/zX9AC6Pe0h9+v\n6WazUblC2MDf5QEjzdVMKs9cK/xJK3uz/yzfetbLv1XUtSnLQpmkSwlrb+GbidUu\nHxyZMPnUXrcPHAw9nJC+9L7+ICjSKMzKQn0mNws0Jq2bVj6+U5A6b5TnMsrzq91t\nQXw415uidu+qzDV+xmFfHN0jT4w63hV+jcwKSMrtXQs2NE0MxuRENbNr9bogsYP8\nSXdxCDgg2WFCKIZzE0K13hJTKjqJm1PhnJU44PFCj/bZfdv4yHBXNiTEM5kZ9GxU\n2+fTKZJgXLyy5EUV2jzj7Y5objSA9vbkYkKX/R98CnxYEMs64r5zNW4ft2kINpOx\nWwIDAQAB\n-----END PUBLIC KEY-----',
    secret: TEST_GIVEAWAY_KEY,
    state: 'ACTIVE',
    title: 'SKNUPS Giveaway',
    type: 'SIMPLE',
}

export const TEST_ENTITIES = {
    giveaway: {
        'test-giveaway': TEST_GIVEAWAY,
        'invalid-public-key': {
            ...TEST_GIVEAWAY,
            code: 'invalid-public-key',
            publicKey: 'invalid',
        },
        'null-public-key': {
            ...TEST_GIVEAWAY,
            code: 'null-public-key',
            publicKey: null,
        },
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
