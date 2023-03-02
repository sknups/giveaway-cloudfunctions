if (process.env.NODE_ENV == 'development') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('source-map-support').install();
    require('dotenv/config')
}
import 'reflect-metadata';
import { HttpFunction } from '@google-cloud/functions-framework';
import logger from './helpers/logger';
import { AllConfig, loadConfig } from './config/all-config';
import { functionWrapper } from './helpers/wrapper';
import { GetGiveaway } from './functions/get-giveaway';
import { UpdateStateGiveaway } from './functions/update-state-giveaway';
import { SaveGiveaway } from './functions/save-giveaway';
import { CreateClaim } from './functions/create-claim';

const CONFIG: Promise<AllConfig> = loadConfig(process.env);
CONFIG.catch(logger.error);

export const getGiveaway: HttpFunction = async (req, res) => functionWrapper(GetGiveaway.handler, req, res, CONFIG);
export const saveGiveaway: HttpFunction = async (req, res) => functionWrapper(SaveGiveaway.handler, req, res, CONFIG);
export const updateStateGiveaway: HttpFunction = async (req, res) => functionWrapper(UpdateStateGiveaway.handler, req, res, CONFIG);
export const createClaim: HttpFunction = async (req, res) => functionWrapper(CreateClaim.handler, req, res, CONFIG);

/**
 * For dev testing only
 */
export const devRouter: HttpFunction = async (req, res) => {

    const path = req.path.split('/')[1];

    switch (path) {
        case 'giveaway-save':
            await saveGiveaway(req, res);
            break;
        case 'giveaway-update-state':
            await updateStateGiveaway(req, res);
            break;
        case 'giveaway-get':
            await getGiveaway(req, res);
            break;
        case 'giveaway-create-claim':
            await createClaim(req, res);
            break;
        default:
            res.status(404).send(`Endpoint ${req.path} not found\n`);
    }

}
