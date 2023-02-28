import * as Joi from 'joi';
import { ConfigFragment } from './config-fragment';

export type GiveawayConfig = {
    flexUrl: string,
    itemCreateUrl: string,
}

const CONFIG: ConfigFragment<GiveawayConfig> = {
    schema: {
        CF_BASE_URL: Joi.string().required(),
        FLEX_URL: Joi.string().required(),
        ITEM_CREATE_FUNCTION: Joi.string().optional().default('item-create'),
    },
    load: (envConfig: NodeJS.Dict<string>): GiveawayConfig => {
        const baseUrl = envConfig.CF_BASE_URL;
        return {
            flexUrl: envConfig.FLEX_URL as string,
            itemCreateUrl: `${baseUrl}/${envConfig.ITEM_CREATE_FUNCTION}`,
        };
    },
};

export default CONFIG;
