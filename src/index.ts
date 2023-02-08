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

const CONFIG: Promise<AllConfig> = loadConfig(process.env);
CONFIG.catch(logger.error);

export const getGiveaway: HttpFunction = async (req, res) => functionWrapper(GetGiveaway.handler, req, res, CONFIG);

/**
 * For dev testing only
 */
export const devRouter: HttpFunction = async (req, res) => {
    if (req.path.startsWith('/giveaway-get/')) {
        await getGiveaway(req, res);
        return;
    }

    res.status(404).send(`Endpoint ${req.path} not found\n`);
}
