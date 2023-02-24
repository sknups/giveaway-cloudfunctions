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

http('giveaway-save', saveGiveaway);

let instance: HttpFunction;

function _testBody(): any {

    const body: SaveGiveawayRequestDto = {
        title: "123456789 SKNUPS Giveaway",
        description: "Amazing SKNUPS Giveaway Description",
        type: GiveawayType.SIMPLE,
        config: "{\"skuEntries\":[{\"code\":\"SKU-123456789\",\"weight\":null}]}",
        publicKey: "-----BEGIN PUBLIC KEY-----\n" +
            "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArYbgztS/BDpFeoVHbfxJ\n" +
            "Dsuqfltk0B88uSNFpzrv+EtA7Q7CksDafr99aj+uv6Dhwa86p11fqi+CagElyCyn\n" +
            "JmEOjF4nw+cqQy3YjcLvVioZwExFDxk75NfajsdjajdndUNPBSgBdyw5UXJhnlBLlw4FnrD3um\n" +
            "o0sNQJIOlgOvGImkQYi8uvJPrHBeXdTjQOPLi9xQgDR64plxC0aPs3ngTCXWlLm1\n" +
            "CwIDAQAB\n" +
            "-----END PUBLIC KEY-----"
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
    const req = { path: `/${code}`, method: 'PUT', body } as Request;
    const res = new MockExpressResponse();
    await instance(req, res);
    return res;
}

describe('function - save-giveaway', () => {

    beforeEach(() => {
        mocks.mockClear()
        instance = getFunction('giveaway-save') as HttpFunction;
    });

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

    it('asserts publicKey is required', async () => {
        const res = await _sendRequest({ publicKey: '' });

        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(res._getString()).toContain('publicKey should not be empty');
    });

    it('asserts publicKey is a string', async () => {
        const res = await _sendRequest({ publicKey: 10 });

        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(res._getString()).toContain('publicKey must be a string');
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
                title: '123456789 SKNUPS Giveaway',
                description: 'Amazing SKNUPS Giveaway Description',
                type: 'SIMPLE',
                config: '{"skuEntries":[{"code":"SKU-123456789","weight":null}]}',
                publicKey: "-----BEGIN PUBLIC KEY-----\n" +
                    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArYbgztS/BDpFeoVHbfxJ\n" +
                    "Dsuqfltk0B88uSNFpzrv+EtA7Q7CksDafr99aj+uv6Dhwa86p11fqi+CagElyCyn\n" +
                    "JmEOjF4nw+cqQy3YjcLvVioZwExFDxk75NfajsdjajdndUNPBSgBdyw5UXJhnlBLlw4FnrD3um\n" +
                    "o0sNQJIOlgOvGImkQYi8uvJPrHBeXdTjQOPLi9xQgDR64plxC0aPs3ngTCXWlLm1\n" +
                    "CwIDAQAB\n" +
                    "-----END PUBLIC KEY-----",
                state: 'ACTIVE'
            },
            STUB_TX
        );
    });

    it('asserts modified giveaway returns 200', async () => {
        const giveawayUpdates = _testBody();
        giveawayUpdates.title = 'Updated title';

        const res = await _sendRequest(giveawayUpdates);

        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(res._getJSON().created).toEqual(false);
        expect(res._getJSON().updated).toEqual(true);
        expect(mocks.datastoreHelper.getEntity).toBeCalledWith('giveaway', 'GIVEAWAY', STUB_TX);
        expect(mocks.datastoreHelper.startTransaction).toBeCalledTimes(1);
        expect(mocks.datastoreHelper.commitTransaction).toBeCalledTimes(1);
        expect(mocks.datastoreHelper.rollbackTransaction).toBeCalledTimes(0);
        expect(mocks.datastoreHelper.saveEntity).toBeCalledWith( 'giveaway', {
            ...giveawayUpdates,
            code: 'GIVEAWAY',
            state: GiveawayState.ACTIVE,
        }, STUB_TX);
    });

    it('asserts not-modified giveaway does not update datastore and returns 200', async () => {
        const res = await _sendRequest();

        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(res._getJSON().created).toEqual(false);
        expect(res._getJSON().updated).toEqual(false);
        expect(mocks.datastoreHelper.getEntity).toBeCalledWith('giveaway', 'GIVEAWAY', STUB_TX);
        expect(mocks.datastoreHelper.startTransaction).toBeCalledTimes(1);
        expect(mocks.datastoreHelper.commitTransaction).toBeCalledTimes(1);
        expect(mocks.datastoreHelper.rollbackTransaction).toBeCalledTimes(0);
        expect(mocks.datastoreHelper.saveEntity).toBeCalledTimes(0);
    });


});
