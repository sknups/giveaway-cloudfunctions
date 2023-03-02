import './test-env';
import { mocks } from '../mocks';
import { Request } from '@google-cloud/functions-framework';
import * as MockExpressResponse from 'mock-express-response';
import { createClaim } from '../../src';
import { StatusCodes } from 'http-status-codes';
import * as fs from 'fs';
import { ItemDto } from '../../src/client/item.client';
const droplinksLegacy = import('@sknups/drop-links-legacy');

async function _createUnrestrictedLucu(keyFile: string, giveaway: string, identifier: string) {

  const key = fs.readFileSync(keyFile).toString();
  const lib = await droplinksLegacy;
  const dropLink = lib.LegacyDropLinks.createUnrestrictedDropLink(key, giveaway, identifier);
  return dropLink.lucu;

};

async function _createLimitedLucu(keyFile: string, giveaway: string, identifier: string, limit: number) {

  const key = fs.readFileSync(keyFile).toString();
  const lib = await droplinksLegacy;
  const dropLink = lib.LegacyDropLinks.createLimitedDropLink(key, giveaway, identifier, limit);
  return dropLink.lucu;

};

const UNRESTRICTED_LUCU = _createUnrestrictedLucu('dev-pem/tetrahedron.pem', 'test-giveaway', 'test-unrestricted-droplink');
const UNRESTRICTED_LUCU2 = _createUnrestrictedLucu('dev-pem/tetrahedron.pem', 'test-giveaway2', 'test-unrestricted-droplink');
const RESTRICTED_LUCU_LIMIT_2 = _createLimitedLucu('dev-pem/tetrahedron.pem', 'test-giveaway', 'test-unrestricted-droplink', 2);

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
        claim: await UNRESTRICTED_LUCU,
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

  describe('drop link v1', () => {
    it('redeem with lucu returns 201 CREATED', async () => {
      const dummyDto: ItemDto = { sku: 'TEST-TETRAHEDRON-GIVEAWAY', token: 'aaaaa11111' };
      mocks.itemClient.createItem.mockReturnValueOnce(dummyDto);

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.CREATED);
      expect(mocks.itemClient.createItem).toHaveBeenCalledTimes(1);
    });

    it('redeem with limited lucu returns 201 CREATED', async () => {
      const dummyDto: ItemDto = { sku: 'TEST-TETRAHEDRON-GIVEAWAY', token: 'aaaaa11111' };
      mocks.itemClient.createItem.mockReturnValueOnce(dummyDto);
      mocks.datastoreHelper.countEntities.mockReturnValue(1);

      req.body.claim = await RESTRICTED_LUCU_LIMIT_2;

      await instance(req, res);

      expect(res.statusCode).toEqual(StatusCodes.CREATED);
      expect(mocks.itemClient.createItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('drop link v1 - error scenarios', () => {
    it('malformed lucu returns 400 BAD_REQUEST', async () => {
      const lucu = await UNRESTRICTED_LUCU;
      req.body.claim = 'xxxxx' + lucu;

      await instance(req, res);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('giveaway mismatch in lucu returns 400 BAD_REQUEST', async () => {
      const lucu = await UNRESTRICTED_LUCU2;
      req.body.claim = lucu;

      await instance(req, res);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('invalid data in lucu returns 400 BAD_REQUEST', async () => {
      req.body.claim = 'aHR0cHM6Ly9za251cHMvY3ViZS1mb3J0dW5lP2lkPVRFU1QxNjc3NTg4ODkzYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFh';

      await instance(req, res);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('invalid publicKey returns 400 BAD_REQUEST', async () => {
      req.body.giveaway = 'invalid-public-key';
      req.body.claim = await _createUnrestrictedLucu('dev-pem/tetrahedron.pem', 'invalid-public-key', 'test-unrestricted-droplink')

      await instance(req, res);

      // This should technicaly be a 5xx error, but the drop links library does not provide sufficient error context to determine the problem
      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('null publicKey returns 403 FORBIDDEN', async () => {
      req.body.giveaway = 'null-public-key';
      req.body.claim = await _createUnrestrictedLucu('dev-pem/tetrahedron.pem', 'null-public-key', 'test-unrestricted-droplink')

      await instance(req, res);

      expect(res._getJSON()).toMatchObject({ code: 'GIVEAWAY_00505' }); //V1_NOT_SUPPORTED
      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    it('invalid signature returns 400 BAD_REQUEST', async () => {
      const fullLucu: string = await UNRESTRICTED_LUCU;
      const lucuWithShortenedSig = fullLucu.substring(0, fullLucu.length - 10);
      req.body.claim = lucuWithShortenedSig;

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
      req.body.claim = await _createUnrestrictedLucu('dev-pem/tetrahedron.pem', 'inactive', 'test-unrestricted-droplink')

      await instance(req, res);

      expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('claim giveaway with exceeded limit returns 403 FORBIDDEN', async () => {
      mocks.datastoreHelper.countEntities.mockReturnValue(2);

      req.body.claim = await RESTRICTED_LUCU_LIMIT_2;

      await instance(req, res);

      expect(res._getJSON()).toMatchObject({ code: 'GIVEAWAY_00501' });
      expect(res.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(mocks.itemClient.createItem).toHaveBeenCalledTimes(0);
    });

    it('claim duplicate returns 403 FORBIDDEN', async () => {
      // Mock some return data for findEntities, which is used to determine whether a claim exists
      mocks.datastoreHelper.findEntities.mockReturnValue([{ somedata: 'somedata' }]);

      await instance(req, res);

      expect(res._getJSON()).toMatchObject({ code: 'GIVEAWAY_00500' });
      expect(res.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(mocks.itemClient.createItem).toHaveBeenCalledTimes(0);
    });
  });

});
