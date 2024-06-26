import './test-env';
import { mocks, STUB_TX } from '../mocks';
import { http, HttpFunction, Request } from '@google-cloud/functions-framework';
import * as MockExpressResponse from 'mock-express-response';
import { getFunction } from '@google-cloud/functions-framework/testing';
import { saveGiveaway } from '../../src';
import { StatusCodes } from 'http-status-codes';
import { SaveGiveawayRequestDto } from '../../src/dto/save-giveaway-request.dto';
import { GiveawayType } from '../../src/dto/giveaway-type.dto';
import { GiveawayState } from '../../src/dto/giveaway-state.dto';
import { TEST_GIVEAWAY_SECRET } from '../test-data-entities';

http('giveaway-save', saveGiveaway);

let instance: HttpFunction;

function _testBody(): any {

    const body: SaveGiveawayRequestDto = {
        title: 'SKNUPS Giveaway',
        description: 'Claim your free SKN now',
        type: GiveawayType.SIMPLE,
        config: '{"skuEntries":[{"code":"TEST-TETRAHEDRON-GIVEAWAY","weight":null}]}',
        secret: TEST_GIVEAWAY_SECRET,
    };
    return body;
}


async function _sendRequest(
    bodyOverrides: any = {},
    bodyModifier = (_body: any) => { },
    code: string = 'test-giveaway',
): Promise<MockExpressResponse> {
    const body = { ..._testBody(), ...bodyOverrides };
    bodyModifier(body);
    const req = { path: `/${code}`, method: 'PUT', body } as Request;
    const res = new MockExpressResponse();
    await instance(req, res);
    return res;
}

describe('function - save-giveaway', () => {

    beforeEach(() => {
        mocks.init();
        instance = getFunction('giveaway-save') as HttpFunction;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('validation - basic', () => {

        it('asserts GET method not supported', async () => {
            const req = { path: '/', method: 'GET' } as Request;
            const res = new MockExpressResponse()

            const instance = saveGiveaway;

            await instance(req, res);

            expect(res.statusCode).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            expect(res._getString()).toContain('GET not allowed');
        });

        it('asserts giveaway code required in path', async () => {
            const req = { path: '/', method: 'PUT', body: _testBody() } as Request;
            const res = new MockExpressResponse();

            const instance = saveGiveaway;

            await instance(req, res);

            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getString()).toContain('GIVEAWAY_00401');
        });

        it('asserts retailers can not call', async () => {
            const req = { path: '/retailer/TEST', method: 'PUT', body: _testBody() } as Request;
            const res = new MockExpressResponse();

            const instance = saveGiveaway;

            await instance(req, res);

            expect(res.statusCode).toEqual(StatusCodes.FORBIDDEN);
            expect(res._getString()).toContain('Not available to retailer');
        });

        it('asserts title is required', async () => {
            const res = await _sendRequest({ title: '' });

            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getString()).toContain('title should not be empty');
        });

        it('asserts title is a string', async () => {
            const res = await _sendRequest({ title: 10 });

            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getString()).toContain('title must be a string');
        });

        it('asserts type is required', async () => {
            const res = await _sendRequest({ type: '' });

            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getString()).toContain('type should not be empty');
        });

        it('asserts type is SIMPLE or FORTUNE', async () => {
            const res = await _sendRequest({ type: 10 });

            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getString()).toContain('type must be one of the following values: SIMPLE, FORTUNE');
        });

        it('asserts description is required', async () => {
            const res = await _sendRequest({ description: '' });

            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getString()).toContain('description should not be empty');
        });

        it('asserts description is a string', async () => {
            const res = await _sendRequest({ description: 10 });

            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getString()).toContain('description must be a string');
        });

        it('asserts config is required', async () => {
            const res = await _sendRequest({ config: '' });

            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getString()).toContain('config should not be empty');
        });

        it('asserts config is a string', async () => {
            const res = await _sendRequest({ config: 10 });

            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getString()).toContain('config must be a string');
        });

        it('asserts secret is not empty', async () => {
            const res = await _sendRequest({ secret: '' });

            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getString()).toContain('secret should not be empty');
        });

        it('asserts secret is required', async () => {
            const res = await _sendRequest({ secret: undefined });

            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getString()).toContain('secret should not be empty');
        });

        it('asserts secret is a string', async () => {
            const res = await _sendRequest({ secret: 10 });

            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getString()).toContain('secret must be a string');
        });

    });

    it('asserts new giveaway saved returns 201', async () => {
        const res = await _sendRequest({}, _body => { }, 'TEST-NEW-GIVEAWAY');

        expect(res.statusCode).toEqual(StatusCodes.CREATED);
        expect(res._getJSON().created).toEqual(true);
        expect(res._getJSON().updated).toEqual(true);

        expect(mocks.datastoreHelper.getEntity).toBeCalledWith('giveaway', 'TEST-NEW-GIVEAWAY', STUB_TX);
        expect(mocks.datastoreHelper.startTransaction).toBeCalledTimes(1);
        expect(mocks.datastoreHelper.commitTransaction).toBeCalledTimes(1);
        expect(mocks.datastoreHelper.rollbackTransaction).toBeCalledTimes(0);

        expect(mocks.datastoreHelper.saveEntity).toBeCalledWith(
            'giveaway',
            {
                code: 'TEST-NEW-GIVEAWAY',
                title: 'SKNUPS Giveaway',
                description: 'Claim your free SKN now',
                type: 'SIMPLE',
                config: '{"skuEntries":[{"code":"TEST-TETRAHEDRON-GIVEAWAY","weight":null}]}',
                secret: TEST_GIVEAWAY_SECRET,
                state: 'ACTIVE'
            },
            STUB_TX,
            ['config']
        );
    });

    it('asserts modified giveaway returns 200', async () => {
        const giveawayUpdates = _testBody();
        giveawayUpdates.title = 'Updated title';

        const res = await _sendRequest(giveawayUpdates);

        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(res._getJSON().created).toEqual(false);
        expect(res._getJSON().updated).toEqual(true);
        expect(mocks.datastoreHelper.getEntity).toBeCalledWith('giveaway', 'test-giveaway', STUB_TX);
        expect(mocks.datastoreHelper.startTransaction).toBeCalledTimes(1);
        expect(mocks.datastoreHelper.commitTransaction).toBeCalledTimes(1);
        expect(mocks.datastoreHelper.rollbackTransaction).toBeCalledTimes(0);
        expect(mocks.datastoreHelper.saveEntity).toBeCalledWith('giveaway', {
            ...giveawayUpdates,
            code: 'test-giveaway',
            state: GiveawayState.ACTIVE,
            secret: TEST_GIVEAWAY_SECRET,
        }, STUB_TX,
            ['config']);
    });

    it('asserts not-modified giveaway does not update datastore and returns 200', async () => {
        const res = await _sendRequest();

        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(res._getJSON().created).toEqual(false);
        expect(res._getJSON().updated).toEqual(false);
        expect(mocks.datastoreHelper.getEntity).toBeCalledWith('giveaway', 'test-giveaway', STUB_TX);
        expect(mocks.datastoreHelper.startTransaction).toBeCalledTimes(1);
        expect(mocks.datastoreHelper.commitTransaction).toBeCalledTimes(1);
        expect(mocks.datastoreHelper.rollbackTransaction).toBeCalledTimes(0);
        expect(mocks.datastoreHelper.saveEntity).toBeCalledTimes(0);
    });


});
