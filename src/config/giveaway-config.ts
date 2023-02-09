import * as Joi from 'joi';
import { ConfigFragment } from './config-fragment';

export type GiveawayConfig = {
    flexUrl: string,
}

const CONFIG: ConfigFragment<GiveawayConfig> = {
    schema: {
        FLEX_URL: Joi.string().required()
    },
    load: (envConfig: NodeJS.Dict<string>): GiveawayConfig => {
        return {
            flexUrl: envConfig.FLEX_URL,
        };
    },
};

export default CONFIG;
