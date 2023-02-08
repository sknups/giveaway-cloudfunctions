import './test-env';
import { Request } from '@google-cloud/functions-framework';
import * as MockExpressResponse from 'mock-express-response';
import { getGiveaway } from '../../src';
import { StatusCodes } from 'http-status-codes';
import { TEST_ENTITIES } from '../test-data-entities';
import { TEST_DTOS } from '../test-data-dtos';
import { GiveawayRepository } from '../../src/persistence/giveaway-repository';

const instance = getGiveaway;

describe('function - get-giveaway - retailer', () => {

    const byCodeSpy = jest.spyOn(GiveawayRepository.prototype, 'byCode');

    const giveawayCode = 'GIVEAWAY-123456789';
    const req = {
        method: 'GET',
        path: `/retailer/${giveawayCode}`,
    } as Request;

    let res = new MockExpressResponse();

    beforeEach(() => {
        res = new MockExpressResponse();
        byCodeSpy.mockReturnValueOnce(Promise.resolve(TEST_ENTITIES.v2));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('asserts \'giveaway code\' required', async () => {
        const req = { method: 'GET', path: '' } as Request;

        await instance(req, res);

        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(res._getString()).toContain('giveaway code must be provided in path');
    });

    it.skip('ignores path additional element', async () => {
        const req = {
            method: 'GET',
            path: `/retailer/bla/${giveawayCode}`,
        } as Request;

        await instance(req, res);

        expect(byCodeSpy).toHaveBeenCalledTimes(1);
        expect(byCodeSpy).toHaveBeenLastCalledWith(giveawayCode);
    });

    it.skip('returns giveaway', async () => {
        await instance(req, res);

        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(byCodeSpy).toHaveBeenCalledTimes(1);
        expect(byCodeSpy).toHaveBeenLastCalledWith(giveawayCode);
        expect(res._getJSON()).toEqual(TEST_DTOS.v2.retailer);
    });

    it.skip('returns 404 if item not found', async () => {
        byCodeSpy.mockReset();
        byCodeSpy.mockReturnValueOnce(Promise.resolve(null));

        await instance(req, res);

        expect(res.statusCode).toEqual(StatusCodes.NOT_FOUND);
        expect(res._getString()).toEqual('Not Found');
    })

});
