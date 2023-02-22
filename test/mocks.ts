import * as sinon from 'sinon';

import { GiveawayEntity } from '../src/entity/giveaway.entity';

export const DEFAULT_DATE_STR = '2022-10-01T10:33:33.000Z';
export const DEFAULT_DATE = new Date(DEFAULT_DATE_STR);
export const STUB_TX = 'STUB_TX';

export type Stubs = {
    startTransaction: sinon.SinonStub,
    commitTransaction: sinon.SinonStub,
    rollbackTransaction: sinon.SinonStub,
    getEntity: sinon.SinonStub,
    saveEntity: sinon.SinonStub,
    updateEntity: sinon.SinonStub
}

export function createStubs(): Stubs {
    const stubs = {
        startTransaction: sinon.stub(require('../src/helpers/datastore/datastore.helper'), 'startTransaction'),
        commitTransaction: sinon.stub(require('../src/helpers/datastore/datastore.helper'), 'commitTransaction'),
        rollbackTransaction: sinon.stub(require('../src/helpers/datastore/datastore.helper'), 'rollbackTransaction'),
        getEntity: sinon.stub(require('../src/helpers/datastore/datastore.helper'), 'getEntity'),
        saveEntity: sinon.stub(require('../src/helpers/datastore/datastore.helper'), 'saveEntity'),
        updateEntity: sinon.stub(require('../src/helpers/datastore/datastore.helper'), 'updateEntity')
    }

    stubs.startTransaction.onFirstCall().returns(STUB_TX);
    stubs.getEntity.withArgs('giveaway', 'GIVEAWAY').returns(mockGiveawayEntity('GIVEAWAY'));

    return stubs;
}

export function mockGiveawayEntity(code: string): GiveawayEntity {
    
    return {
        code,
        title: "123456789 SKNUPS Giveaway",
        description: "Amazing SKNUPS Giveaway Description",
        type: "SIMPLE",
        state: "ACTIVE",
        config: "{\"skuEntries\":[{\"code\":\"SKU-123456789\",\"weight\":null}]}",
        publicKey: "-----BEGIN PUBLIC KEY-----\n" +
        "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArYbgztS/BDpFeoVHbfxJ\n" +
        "Dsuqfltk0B88uSNFpzrv+EtA7Q7CksDafr99aj+uv6Dhwa86p11fqi+CagElyCyn\n" +
        "JmEOjF4nw+cqQy3YjcLvVioZwExFDxk75NfajsdjajdndUNPBSgBdyw5UXJhnlBLlw4FnrD3um\n" +
        "o0sNQJIOlgOvGImkQYi8uvJPrHBeXdTjQOPLi9xQgDR64plxC0aPs3ngTCXWlLm1\n" +
        "CwIDAQAB\n" +
        "-----END PUBLIC KEY-----",
        version: "2"
    };
}