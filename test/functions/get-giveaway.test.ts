import './test-env';
import { mocks } from '../mocks';
import { Request } from '@google-cloud/functions-framework';
import * as MockExpressResponse from 'mock-express-response';
import { getGiveaway } from '../../src';
import { StatusCodes } from 'http-status-codes';
import { TEST_DTOS } from '../test-data-dtos';

const instance = getGiveaway;

describe('function - get-giveaway - retailer', () => {

    let res: MockExpressResponse;
    const giveawayCode = 'test-giveaway';

    const req = {
        method: 'GET',
        path: `/retailer/${giveawayCode}`,
    } as Request;

    beforeEach(() => {
        mocks.init();
        res = new MockExpressResponse();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('asserts \'giveaway code\' required', async () => {
        const req = { method: 'GET', path: '' } as Request;

        await instance(req, res);

        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(res._getString()).toContain('GIVEAWAY_00401');
    });

    it('ignores path additional element', async () => {
        const req = {
            method: 'GET',
            path: `/retailer/bla/${giveawayCode}`,
        } as Request;

        await instance(req, res);

        expect(mocks.datastoreHelper.getEntity).toHaveBeenCalledTimes(1);
        expect(mocks.datastoreHelper.getEntity).toHaveBeenLastCalledWith('giveaway', giveawayCode);
    });

    it('returns giveaway', async () => {
        await instance(req, res);

        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(mocks.datastoreHelper.getEntity).toHaveBeenCalledTimes(1);
        expect(mocks.datastoreHelper.getEntity).toHaveBeenLastCalledWith('giveaway', giveawayCode);
        expect(res._getJSON()).toEqual(TEST_DTOS.giveaway.retailer[giveawayCode]);
    });

    it('returns 404 if item not found', async () => {
        const req = { method: 'GET', path: '/retailer/invalid-giveaway-code' } as Request;

        await instance(req, res);

        expect(res.statusCode).toEqual(StatusCodes.NOT_FOUND);
        expect(res._getJSON().code).toEqual('GIVEAWAY_00001');
    })

});
