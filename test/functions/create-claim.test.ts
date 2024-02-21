import './test-env';
import { mocks } from '../mocks';
import { Request } from '@google-cloud/functions-framework';
import * as MockExpressResponse from 'mock-express-response';
import { createClaim } from '../../src';
import { StatusCodes } from 'http-status-codes';
import * as fs from 'fs';
import { ItemDto } from '../../src/client/item.client';
import { TEST_GIVEAWAY_SECRET } from '../test-data-entities';
import { ClaimEntity } from '../../src/entity/claim.entity';
import { createLimitedDropLink, createUnrestrictedDropLink } from '../../src/helpers/drop-links';

async function _createUnrestrictedClaim(key: string, giveaway: string, identifier?: number): Promise<string> {

  return await createUnrestrictedDropLink(key, giveaway, identifier);

};

async function _createLimitedClaim(key: string, giveaway: string, limit: number, identifier?: number): Promise<string> {

  return await createLimitedDropLink(key, giveaway, identifier, limit);

};

function _claimEntity(overrides?: Partial<ClaimEntity>): ClaimEntity {
  return {
    code: 'aaaaa11111',
    dropLinkIdentifier: 'test-droplink-id',
    giveawayCode: 'test-giveaway',
    user: 'test-user',
    ...overrides,
  };
}

const UNRESTRICTED_CLAIM = _createUnrestrictedClaim(TEST_GIVEAWAY_SECRET, 'test-giveaway');
const LIMITED_CLAIM_LIMIT_2 = _createLimitedClaim(TEST_GIVEAWAY_SECRET, 'test-giveaway', 2, 22222);

describe('function - create-claim', () => {

  let req: Request;
  let res: MockExpressResponse;

  const instance = createClaim;

  beforeEach(async () => {
    mocks.init();
    mocks.datastoreHelper.findEntities.mockReturnValue([]);

    req = {
      method: 'POST',
      body: {
        giveaway: 'test-giveaway',
        user: 'test-user',
        claim: await UNRESTRICTED_CLAIM,
      },
    } as Request;
    res = new MockExpressResponse();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('validation - basic', () => {
    it('claim without giveaway returns 400 BAD_REQUEST', async () => {
      delete req.body.giveaway;

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(res._getString()).toContain('giveaway should not be empty');
    });

    it('claim with empty giveaway returns 400 BAD_REQUEST', async () => {
      req.body.giveaway = '';

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(res._getString()).toContain('giveaway should not be empty');
    });

    it('claim with numeric giveaway returns 400 BAD_REQUEST', async () => {
      req.body.giveaway = 1234;

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(res._getString()).toContain('giveaway must be a string');
    });

    it('claim without user returns 400 BAD_REQUEST', async () => {
      delete req.body.user;

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(res._getString()).toContain('user should not be empty');
    });

    it('claim with empty user returns 400 BAD_REQUEST', async () => {
      req.body.user = '';

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(res._getString()).toContain('user should not be empty');
    });

    it('claim with numeric user returns 400 BAD_REQUEST', async () => {
      req.body.user = 1234;

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(res._getString()).toContain('user must be a string');
    });

    it('claim without claim returns 400 BAD_REQUEST', async () => {
      delete req.body.claim;

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(res._getString()).toContain('claim should not be empty');
    });

    it('claim with empty claim returns 400 BAD_REQUEST', async () => {
      req.body.claim = '';

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(res._getString()).toContain('claim should not be empty');
    });

    it('claim with numeric claim returns 400 BAD_REQUEST', async () => {
      req.body.claim = 1234;

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(res._getString()).toContain('claim must be a string');
    });
  });

  describe('drop link v2', () => {
    it('redeem v2 returns 201 CREATED', async () => {
      const dummyDto: ItemDto = { sku: 'TEST-TETRAHEDRON-GIVEAWAY', token: 'aaaaa11111' };
      mocks.itemClient.createItem.mockReturnValueOnce(dummyDto);

      req.body.claim = await UNRESTRICTED_CLAIM;

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.CREATED);
      expect(mocks.itemClient.createItem).toHaveBeenCalledTimes(1);
      expect(mocks.datastoreHelper.saveEntity).toHaveBeenLastCalledWith(
        'claim',
        _claimEntity({ dropLinkIdentifier: 'unlimited' }),
      );
      expect(mocks.datastoreHelper.saveEntity).toHaveBeenCalledTimes(1);
    });

    it('redeem v2 uses correct identifier', async () => {
      const dummyDto: ItemDto = { sku: 'TEST-TETRAHEDRON-GIVEAWAY', token: 'aaaaa11111' };
      mocks.itemClient.createItem.mockReturnValueOnce(dummyDto);

      req.body.claim = await _createUnrestrictedClaim(TEST_GIVEAWAY_SECRET, 'test-giveaway', 15);

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.CREATED);
      expect(mocks.itemClient.createItem).toHaveBeenCalledTimes(1);
      expect(mocks.datastoreHelper.saveEntity).toHaveBeenLastCalledWith(
        'claim',
        _claimEntity({ dropLinkIdentifier: 'unlimited-f' }),
      );
      expect(mocks.datastoreHelper.saveEntity).toHaveBeenCalledTimes(1);
    });

    it('redeem limited v2 returns 201 CREATED', async () => {
      const dummyDto: ItemDto = { sku: 'TEST-TETRAHEDRON-GIVEAWAY', token: 'aaaaa11111' };
      mocks.itemClient.createItem.mockReturnValueOnce(dummyDto);
      mocks.datastoreHelper.countEntities.mockReturnValue(1);

      req.body.claim = await _createLimitedClaim(TEST_GIVEAWAY_SECRET, 'test-giveaway', 2);

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.CREATED);
      expect(mocks.itemClient.createItem).toHaveBeenCalledTimes(1);
      expect(mocks.datastoreHelper.saveEntity).toHaveBeenLastCalledWith(
        'claim',
        _claimEntity({ dropLinkIdentifier: 'limited-00000' }),
      );
      expect(mocks.datastoreHelper.saveEntity).toHaveBeenCalledTimes(1);
    });

    it('redeem limited v2 uses correct identifier', async () => {
      const dummyDto: ItemDto = { sku: 'TEST-TETRAHEDRON-GIVEAWAY', token: 'aaaaa11111' };
      mocks.itemClient.createItem.mockReturnValueOnce(dummyDto);
      mocks.datastoreHelper.countEntities.mockReturnValue(1);

      req.body.claim = await _createLimitedClaim(TEST_GIVEAWAY_SECRET, 'test-giveaway', 2, 11223);

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.CREATED);
      expect(mocks.itemClient.createItem).toHaveBeenCalledTimes(1);
      expect(mocks.datastoreHelper.saveEntity).toHaveBeenLastCalledWith(
        'claim',
        _claimEntity({ dropLinkIdentifier: 'limited-02bd7' }),
      );
      expect(mocks.datastoreHelper.saveEntity).toHaveBeenCalledTimes(1);
    });
  });

  describe('drop link v2 - error scenarios', () => {
    beforeEach(async () => {
      req.body.claim = await UNRESTRICTED_CLAIM;
    });

    it('malformed claim code returns 400 BAD_REQUEST', async () => {
      req.body.claim = 'xxxxx' + req.body.claim;

      await instance(req, res);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('giveaway mismatch in claim code returns 400 BAD_REQUEST', async () => {
      req.body.claim = await _createUnrestrictedClaim(TEST_GIVEAWAY_SECRET, 'test-giveaway-mismatch');

      await instance(req, res);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('invalid data in claim code returns 400 BAD_REQUEST', async () => {
      req.body.claim = 'aHR0cHM6Ly9za251cHMvY3ViZS1mb3J0dW5lP2lkPVRFU1QxNjc3NTg4ODkzYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFh';

      await instance(req, res);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('invalid secret returns 400 BAD_REQUEST', async () => {
      req.body.giveaway = 'invalid-secret-key';
      req.body.claim = await _createUnrestrictedClaim(TEST_GIVEAWAY_SECRET, 'invalid-secret-key');

      await instance(req, res);

      // This should technicaly be a 5xx error, but the drop links library does not provide sufficient error context to determine the problem
      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('null secret returns 404 NOT_FOUND', async () => {
      req.body.giveaway = 'null-secret-key';
      req.body.claim = await _createUnrestrictedClaim(TEST_GIVEAWAY_SECRET, 'null-secret-key');

      await instance(req, res);

      expect(res._getJSON()).toMatchObject({ code: 'GIVEAWAY_00300' }); //ENTITY_NOT_FOUND
      expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('claim with wrong key returns 400 BAD_REQUEST', async () => {
      const key = '00' + TEST_GIVEAWAY_SECRET.substring(2);
      req.body.claim = await _createUnrestrictedClaim(key, 'test-giveaway');

      await instance(req, res);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe('error scenarios - common', () => {
    it('claim invalid giveaway returns 404 NOT_FOUND', async () => {
      req.body.giveaway = 'does-not-exist';

      await instance(req, res);

      expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('claim inactive giveaway returns 404 NOT_FOUND', async () => {
      req.body.giveaway = 'inactive';
      req.body.claim = await _createUnrestrictedClaim(TEST_GIVEAWAY_SECRET, 'inactive')

      await instance(req, res);

      expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('claim giveaway with exceeded limit returns 403 FORBIDDEN', async () => {
      mocks.datastoreHelper.countEntities.mockReturnValue(2);

      req.body.claim = await LIMITED_CLAIM_LIMIT_2;

      await instance(req, res);

      expect(res._getJSON()).toMatchObject({ code: 'GIVEAWAY_00501' });
      expect(res.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(mocks.itemClient.createItem).toHaveBeenCalledTimes(0);
    });

    it('claim duplicate returns 200 OK', async () => {
      // Mock some return data for findEntities, which is used to determine whether a claim exists
      mocks.datastoreHelper.findEntities.mockReturnValue([{ somedata: 'somedata', code: 'code' }]);
      mocks.itemClient.getItemForRetailer.mockReturnValue({ sku: 'TEST-TETRAHEDRON-GIVEAWAY', token: 'aaaaa11111' });

      await instance(req, res);

      expect(res._getJSON()).toMatchObject({ sku: 'TEST-TETRAHEDRON-GIVEAWAY', token: 'aaaaa11111' });
      expect(res.statusCode).toEqual(StatusCodes.OK);
      expect(mocks.itemClient.createItem).toHaveBeenCalledTimes(0);
      expect(mocks.itemClient.getItemForRetailer).toHaveBeenCalledTimes(1);
    });
  });

});
