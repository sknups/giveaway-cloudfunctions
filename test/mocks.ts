import { GiveawayEntity } from '../src/entity/giveaway.entity';

export const DEFAULT_DATE_STR = '2022-10-01T10:33:33.000Z';
export const DEFAULT_DATE = new Date(DEFAULT_DATE_STR);
export const STUB_TX = 'STUB_TX';

const datastoreHelper = {
    startTransaction: jest.fn().mockImplementation(()=> {return STUB_TX }),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    getEntity: jest.fn().mockImplementation((entity: string, code: string) => {
      if (entity === 'giveaway' && code == 'GIVEAWAY') {
        return mockGiveawayEntity('GIVEAWAY')
      }
      return null;
    }),
    saveEntity: jest.fn(),
    updateEntity: jest.fn(),
    createContext: jest.fn()
  }

export const mocks = {
    datastoreHelper,
    mockClear: () => {
      datastoreHelper.getEntity.mockClear();
      datastoreHelper.saveEntity.mockClear();
      datastoreHelper.updateEntity.mockClear();
      datastoreHelper.startTransaction.mockClear();
      datastoreHelper.commitTransaction.mockClear();
      datastoreHelper.rollbackTransaction.mockClear();
      datastoreHelper.createContext.mockClear();
    },
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


jest.mock('../src/helpers/datastore/datastore.helper', () => datastoreHelper);