import './test-env';
import { http, HttpFunction, Request } from '@google-cloud/functions-framework';
import * as MockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';
import { getFunction } from '@google-cloud/functions-framework/testing';
import { updateStateGiveaway } from '../../src';
import { StatusCodes } from 'http-status-codes';
import { createStubs, Stubs, STUB_TX } from '../mocks';
import { SetGiveawayStateRequestDto } from '../../src/dto/set-giveaway-state-request.dto';
import { GiveawayState } from '../../src/dto/giveaway-state.dto';

http('giveaway-set-state', updateStateGiveaway);

let instance: HttpFunction;
let stubs: Stubs;

function _testBody(): any {

    const body: SetGiveawayStateRequestDto = {
        state: GiveawayState["SUSPENDED"]
    };
    return body;
}


async function _sendRequest(
    bodyOverrides: any = {},
    bodyModifier = (_body: any) => { },
    code: string = 'GIVEAWAY',
): Promise<MockExpressResponse> {
    const body = { ..._testBody(), ...bodyOverrides };
    bodyModifier(body);
    const req = { path: `/${code}`, method: 'POST', body } as Request;
    const res = new MockExpressResponse();
    await instance(req, res);
    return res;
}

describe('function - save-giveaway', () => {

    beforeEach(() => {
        stubs = createStubs();
        instance = getFunction('giveaway-set-state') as HttpFunction;
    });

    afterEach(function () {
        sinon.restore();
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
        sinon.assert.calledOnce(stubs.getEntity);
    });


});
