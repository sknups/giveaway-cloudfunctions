import './test-env';
import { mocks } from '../mocks';
import { http, HttpFunction, Request } from '@google-cloud/functions-framework';
import * as MockExpressResponse from 'mock-express-response';
import { getFunction } from '@google-cloud/functions-framework/testing';
import { updateStateGiveaway } from '../../src';
import { StatusCodes } from 'http-status-codes';
import { SetGiveawayStateRequestDto } from '../../src/dto/set-giveaway-state-request.dto';
import { GiveawayState } from '../../src/dto/giveaway-state.dto';

http('giveaway-update-state', updateStateGiveaway);

let instance: HttpFunction;

function _testBody(): SetGiveawayStateRequestDto {
    return {
        state: GiveawayState.SUSPENDED
    };
}


async function _sendRequest(
    bodyOverrides: any = {},
    bodyModifier = (_body: any) => { },
    code: string = 'test-giveaway',
): Promise<MockExpressResponse> {
    const body = { ..._testBody(), ...bodyOverrides };
    bodyModifier(body);
    const req = { path: `/${code}`, method: 'POST', body } as Request;
    const res = new MockExpressResponse();
    await instance(req, res);
    return res;
}

describe('function - giveaway-update-state', () => {

    beforeEach(() => {
        mocks.init();
        instance = getFunction('giveaway-update-state') as HttpFunction;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('asserts GET method not supported', async () => {
        const req = { path: '/', method: 'GET' } as Request;
        const res = new MockExpressResponse()

        await instance(req, res);

        expect(res.statusCode).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
        expect(res._getString()).toContain('GET not allowed');
    });

    it('asserts giveaway code required in path', async () => {
        const body = { state: 'SUSPENDED' };
        const req = { path: '/', method: 'POST', body: body } as Request;
        const res = new MockExpressResponse();

        await instance(req, res);

        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(res._getString()).toContain('giveaway code must be provided in path');
    });

    it('asserts retailers can not call', async () => {
        const body = { state: 'SUSPENDED' };
        const req = { path: '/retailer/TEST', method: 'POST', body: body } as Request;
        const res = new MockExpressResponse();

        await instance(req, res);

        expect(res.statusCode).toEqual(StatusCodes.FORBIDDEN);
        expect(res._getString()).toContain('Not available to retailer');
    });

    it('asserts state is required', async () => {
        const res = await _sendRequest({ state: '' });

        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(res._getString()).toContain('state should not be empty');
    });

    it('asserts state is a string', async () => {
        const res = await _sendRequest({ state: 10 });

        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(res._getString()).toContain('state must be one of the following values: ACTIVE, SUSPENDED');
    });

    it('asserts update giveaway state returns 200', async () => {
        const body = { state: 'SUSPENDED' };

        const res = await _sendRequest(body);

        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(mocks.datastoreHelper.getEntity).toBeCalledTimes(1);
    });


});
