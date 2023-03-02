import { TEST_ENTITIES } from './test-data-entities';

export const STUB_TX = 'STUB_TX';

const datastoreHelper = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  getEntity: jest.fn(),
  saveEntity: jest.fn(),
  updateEntity: jest.fn(),
  createContext: jest.fn(),
  findEntities: jest.fn(),
  countEntities: jest.fn(),
}

const itemClient = {
  createItem: jest.fn(),
}

export const mocks = {
  datastoreHelper,
  itemClient,
  init: () => {
    datastoreHelper.startTransaction.mockImplementation(() => { return STUB_TX });
    datastoreHelper.getEntity.mockImplementation((kind: string, code: string) => TEST_ENTITIES[kind]?.[code] ?? null);
  }
}

jest.mock('../src/helpers/datastore/datastore.helper', () => datastoreHelper);
jest.mock('../src/client/item.client', () => itemClient);
